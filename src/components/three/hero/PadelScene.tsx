"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import Stage from "@/components/three/Stage";
import Court from "@/components/three/hero/Court";
import PadelPlayer, { restingPose } from "@/components/three/hero/PadelPlayer";
import type { PadelPlayerHandle, PadelPose } from "@/components/three/hero/PadelPlayer";
import { damp, lerp, track } from "@/components/three/anim";
import { geometries, toonMaterial } from "@/components/three/toon";
import type { ScrollProgress } from "@/hooks/useSectionProgress";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";

const PLAYER_Z = -2.2;

/**
 * The whole point: one pass, one direction. Scrolling down plays the gesture,
 * scrolling up never plays it backwards (see the recover blend below).
 */
const player = {
    lift: [
        [0, 0],
        [0.3, 0],
        [0.37, 0.18],
        [0.5, 0.92],
        [0.58, 0.86],
        [0.74, 0],
        [1, 0],
    ],
    crouch: [
        [0, 0.35],
        [0.28, 0.9],
        [0.4, 0.1],
        [0.52, 0],
        [0.7, 0.2],
        [0.8, 0.8],
        [0.92, 0.42],
        [1, 0.35],
    ],
    swing: [
        [0, 0.05],
        [0.24, 0.22],
        [0.44, 1],
        [0.5, 0.96],
        [0.58, 0.14],
        [0.72, 0.1],
        [1, 0.05],
    ],
    elbow: [
        [0, 0.3],
        [0.3, 0.95],
        [0.44, 0.72],
        [0.51, 0.06],
        [0.62, 0.35],
        [1, 0.3],
    ],
    lean: [
        [0, 0.16],
        [0.3, 0.04],
        [0.46, -0.14],
        // A light follow-through, not a full fold, so he keeps facing the camera.
        [0.57, 0.16],
        [0.72, 0.14],
        [1, 0.16],
    ],
    guard: [
        [0, 0.2],
        [0.36, 0.8],
        [0.5, 0.88],
        [0.62, 0.25],
        [1, 0.2],
    ],
    stride: [
        [0, 0.12],
        [0.37, 0.55],
        [0.52, 0.35],
        [0.7, 0.15],
        [1, 0.12],
    ],
    turn: [
        [0, 0.16],
        [0.4, 0.06],
        [0.52, -0.16],
        [0.7, 0.06],
        [1, 0.16],
    ],
} satisfies Record<string, [number, number][]>;

/**
 * The padel "par 4": the lob drops onto the player, he smashes it into the
 * near court floor, it kicks off the ground and rockets out past the camera,
 * off the page. z grows huge in the last third so the exit reads as fast.
 */
const ball = {
    x: [
        [0, -0.2],
        [0.46, 0],
        [0.6, 0.24],
        [0.8, 0.7],
        [1, 1.5],
    ],
    y: [
        [0, 4.6],
        [0.3, 3.4],
        [0.46, 2.5],
        [0.6, 0.14],
        [0.66, 0.7],
        [0.72, 1.7],
        [0.8, 3.2],
        [0.9, 5.2],
        [1, 7],
    ],
    z: [
        // Comes in from the near court over the net...
        [0, 2.6],
        [0.3, 0.5],
        // ...contact just in front of the player...
        [0.46, -1.7],
        // ...smashed down into the near-court floor...
        [0.6, 1.4],
        [0.66, 1.05],
        // ...rises across the frame, then rockets past the camera (z ~ 5.7).
        [0.72, 2.2],
        [0.8, 4.4],
        [0.9, 8],
        [1, 14],
    ],
} satisfies Record<string, [number, number][]>;

const ballMaterial = toonMaterial("#dbe4c9");

function poseAt(time: number): PadelPose {
    return {
        x: 0,
        y: track(time, player.lift),
        z: PLAYER_Z,
        turn: track(time, player.turn),
        lean: track(time, player.lean),
        crouch: track(time, player.crouch),
        swing: track(time, player.swing),
        elbow: track(time, player.elbow),
        guard: track(time, player.guard),
        stride: track(time, player.stride),
    };
}

function blendPose(from: PadelPose, to: PadelPose, amount: number): PadelPose {
    return {
        x: lerp(from.x, to.x, amount),
        y: lerp(from.y, to.y, amount),
        z: lerp(from.z, to.z, amount),
        turn: lerp(from.turn, to.turn, amount),
        lean: lerp(from.lean, to.lean, amount),
        crouch: lerp(from.crouch, to.crouch, amount),
        swing: lerp(from.swing, to.swing, amount),
        elbow: lerp(from.elbow, to.elbow, amount),
        guard: lerp(from.guard, to.guard, amount),
        stride: lerp(from.stride, to.stride, amount),
    };
}

/** Below this the gesture has not started, so scrubbing back up reads fine. */
const RESUME_BELOW = 0.28;

const restingAtCourt: PadelPose = { ...restingPose, z: PLAYER_Z };

function PadelAction({ progress }: { progress: ScrollProgress }) {
    const playerRef = useRef<PadelPlayerHandle>(null);
    const ballRef = useRef<Mesh>(null);
    const groupRef = useRef<Group>(null);
    const invalidate = useThree((state) => state.invalidate);

    const motion = useRef({ lastProgress: 0, gesture: 0, recover: 0 });

    useFrame((_, delta) => {
        const current = progress.current;
        const state = motion.current;
        const goingForward = current >= state.lastProgress - 0.0001;
        state.lastProgress = current;

        // Scrolling back up holds the last pose, then arcs to the guard stance
        // instead of rewinding the smash. Below RESUME_BELOW nothing has
        // happened yet, so normal scrubbing resumes.
        if (goingForward || current < RESUME_BELOW) {
            state.gesture = current;
            state.recover = damp(state.recover, 0, 0.0005, delta);
        } else {
            state.recover = damp(state.recover, 1, 0.02, delta);
        }

        const scrubbed = poseAt(state.gesture);
        const pose =
            state.recover > 0.001
                ? blendPose(scrubbed, restingAtCourt, state.recover)
                : scrubbed;

        playerRef.current?.applyPose(pose);

        if (ballRef.current) {
            const time = state.gesture;
            ballRef.current.position.set(
                track(time, ball.x),
                track(time, ball.y),
                track(time, ball.z)
            );
            // The ball has no resting pose, so it shrinks out during recovery.
            // It also grows a touch on the way out to sell the speed at the camera.
            const fade = 1 - state.recover;
            const rush = 1 + Math.max(0, (time - 0.66) / 0.34) * 0.5;
            ballRef.current.scale.setScalar(0.14 * fade * rush);
        }

        if (groupRef.current) {
            // A touch of parallax so the group is never dead still.
            groupRef.current.position.y = -0.1 + Math.sin(current * Math.PI) * 0.06;
        }

        // frameloop is "demand": keep asking while the recovery is still moving.
        if (state.recover > 0.002 && state.recover < 0.998) {
            invalidate();
        }
    });

    return (
        <group ref={groupRef}>
            <Court />
            <PadelPlayer ref={playerRef} />
            <mesh ref={ballRef} geometry={geometries.sphere} material={ballMaterial} />
        </group>
    );
}

export default function PadelScene({
    progress,
    capability,
}: {
    progress: ScrollProgress;
    capability: DeviceCapability;
}) {
    return (
        <Stage
            // Three-quarter view from the player's left so the incoming lob and
            // the smash both read, rather than a flat side-on shot.
            camera={{ position: [-3, 2.05, 5.7], fov: 27 }}
            lookAt={[0.1, 1.5, -1.3]}
            capability={capability}
            progress={progress}
            fog={[8.5, 16]}
            shadow={{ position: [0, 0, -1], scale: 9, opacity: 0.3, blur: 2.6 }}
        >
            <PadelAction progress={progress} />
        </Stage>
    );
}
