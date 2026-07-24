"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import Stage from "@/components/three/Stage";
import Court from "@/components/three/hero/Court";
import PadelPlayer, { restingPose } from "@/components/three/hero/PadelPlayer";
import type { PadelPlayerHandle, PadelPose } from "@/components/three/hero/PadelPlayer";
import { damp, lerp, track } from "@/components/three/anim";
import { geometries, padelBallTexture, toonMaterial } from "@/components/three/toon";
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
        [0.28, 0],
        [0.38, 0.3],
        [0.48, 0.9],
        [0.56, 0.8],
        [0.72, 0],
        [1, 0],
    ],
    crouch: [
        [0, 0.35],
        [0.26, 0.85],
        [0.38, 0.2],
        [0.5, 0.05],
        [0.66, 0.25],
        [0.8, 0.8],
        [0.92, 0.42],
        [1, 0.35],
    ],
    // Racket stays low while the lob drops in, then the arm takes it up and
    // behind the head and chops back down; contact is on the way down, once the
    // racket has come back past head height.
    swing: [
        [0, 0.05],
        [0.34, 0.1],
        [0.44, 1],
        [0.52, 0.6],
        [0.6, 0.2],
        [0.72, 0.1],
        [1, 0.05],
    ],
    // Elbow cocked at the top (racket behind the head), snapping open into the hit.
    elbow: [
        [0, 0.3],
        [0.34, 0.4],
        [0.44, 0.9],
        [0.52, 0.35],
        [0.6, 0.1],
        [0.68, 0.35],
        [1, 0.3],
    ],
    // Leans back to load, then drives forward through the hit.
    lean: [
        [0, 0.16],
        [0.36, -0.12],
        [0.46, -0.02],
        [0.54, 0.2],
        [0.66, 0.15],
        [1, 0.16],
    ],
    guard: [
        [0, 0.2],
        [0.38, 0.8],
        [0.5, 0.7],
        [0.62, 0.25],
        [1, 0.2],
    ],
    stride: [
        [0, 0.12],
        [0.42, 0.55],
        [0.52, 0.35],
        [0.7, 0.15],
        [1, 0.12],
    ],
    turn: [
        [0, 0.16],
        [0.44, 0.06],
        [0.52, -0.1],
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
        [0.52, 0.05],
        [0.62, 0.35],
        // Kicks off and flies out hard to the right, off the page.
        [0.72, 1.5],
        [0.84, 4],
        [1, 8],
    ],
    y: [
        [0, 4.8],
        [0.34, 3.6],
        // Contact, high and in front, once the racket is back down at head height.
        [0.52, 2.5],
        // Driven near straight down and dwelling on the floor so the bounce reads.
        [0.6, 0.1],
        [0.64, 0.1],
        // Kicks off the ground, climbing gently as it leaves to the right.
        [0.7, 0.7],
        [0.8, 1.5],
        [0.9, 2.4],
        [1, 3.6],
    ],
    z: [
        // Comes in from the near court over the net...
        [0, 2.6],
        [0.34, 0.6],
        // ...contact just in front of the player...
        [0.52, -1.3],
        // ...smashed down onto the floor just behind the net, where it is visible...
        [0.6, 0.5],
        [0.64, 0.5],
        // ...then away to the right, holding depth so it stays big and visible.
        [0.72, 0.8],
        [0.84, 1.2],
        [1, 1.8],
    ],
} satisfies Record<string, [number, number][]>;


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

    // Built here (not at module scope) so the canvas texture is only created in
    // the browser, never during a server prerender.
    const ballMaterial = useMemo(() => {
        const material = toonMaterial("#9bb36e").clone();
        material.color.set("#ffffff");
        material.map = padelBallTexture();
        return material;
    }, []);

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
            // It grows on the way out so the exit reads as leaving the page.
            const fade = 1 - state.recover;
            const rush = 1 + Math.max(0, (time - 0.6) / 0.4) * 1.4;
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
            // the smash both read. Pulled back and aimed lower so the near-court
            // bounce sits in frame and the ball can be tracked off to the right.
            camera={{ position: [-3.2, 2.3, 7], fov: 30 }}
            lookAt={[0.2, 1.55, -0.8]}
            capability={capability}
            progress={progress}
            fog={[10, 18]}
            shadow={{ position: [0, 0, -1], scale: 9, opacity: 0.3, blur: 2.6 }}
        >
            <PadelAction progress={progress} />
        </Stage>
    );
}
