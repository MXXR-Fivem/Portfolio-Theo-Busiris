"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Mesh } from "three";
import Stage from "@/components/three/Stage";
import Court from "@/components/three/hero/Court";
import PadelPlayer from "@/components/three/hero/PadelPlayer";
import type { PadelPlayerHandle, PadelPose } from "@/components/three/hero/PadelPlayer";
import { clamp, lerp, track } from "@/components/three/anim";
import { geometries, padelBallTexture, toonMaterial } from "@/components/three/toon";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";

const PLAYER_Z = -2.2;

/** Seconds for one full rally: approach, smash, bounce, exit, brief rest. */
const PERIOD = 5;

/**
 * The player's body, keyed on the 0->1 rally clock. The racket stays low while
 * the lob drops, cocks up and back behind the head, then chops down; contact is
 * once it has come back past head height.
 */
const player = {
    lift: [
        [0, 0],
        [0.28, 0],
        [0.38, 0.3],
        [0.48, 0.92],
        [0.56, 0.82],
        [0.74, 0],
        [1, 0],
    ],
    crouch: [
        [0, 0.35],
        [0.26, 0.85],
        [0.38, 0.2],
        [0.5, 0.05],
        [0.66, 0.25],
        [0.82, 0.7],
        [0.94, 0.42],
        [1, 0.35],
    ],
    swing: [
        [0, 0.05],
        [0.34, 0.1],
        [0.44, 1],
        [0.52, 0.55],
        [0.6, 0.2],
        [0.72, 0.1],
        [1, 0.05],
    ],
    elbow: [
        [0, 0.3],
        [0.34, 0.45],
        [0.44, 1],
        [0.52, 0.3],
        [0.6, 0.1],
        [0.68, 0.35],
        [1, 0.3],
    ],
    lean: [
        [0, 0.16],
        [0.36, -0.14],
        [0.46, -0.04],
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

/**
 * The ball as a clean three-phase path rather than eased keyframes, so it never
 * trembles: a constant-speed lob in, a sharp acceleration the instant it is
 * struck, then an accelerating exit off the right of the page.
 */
const HIT = 0.5;
const BOUNCE = 0.64;
const GONE = 0.94;

// The lob start is relative to the measured contact; bounce and exit are fixed.
const APPROACH: [number, number, number] = [-0.35, 2.65, 4.6];
const BOUNCE_AT: [number, number, number] = [1.6, 0.13, 2.2];
const EXIT: [number, number, number] = [10, 3.8, 2.8];

function ballAt(g: number, contact: Vector3, out: Vector3) {
    if (g < HIT) {
        // Constant-speed lob dropping onto the racket's contact point.
        const u = clamp((g - 0.08) / (HIT - 0.08), 0, 1);
        out.set(
            lerp(contact.x + APPROACH[0], contact.x, u),
            lerp(contact.y + APPROACH[1], contact.y, u),
            lerp(contact.z + APPROACH[2], contact.z, u)
        );
        return;
    }

    if (g < BOUNCE) {
        // Struck: fast down and forward, easing into the floor.
        const u = (g - HIT) / (BOUNCE - HIT);
        out.set(
            lerp(contact.x, BOUNCE_AT[0], u),
            lerp(contact.y, BOUNCE_AT[1], u * (2 - u)),
            lerp(contact.z, BOUNCE_AT[2], u)
        );
        return;
    }

    // Kicks off and accelerates off the right edge.
    const u = clamp((g - BOUNCE) / (GONE - BOUNCE), 0, 1);
    out.set(
        lerp(BOUNCE_AT[0], EXIT[0], u * u),
        lerp(BOUNCE_AT[1], EXIT[1], Math.sqrt(u)),
        lerp(BOUNCE_AT[2], EXIT[2], u)
    );
}

function ballScale(g: number) {
    if (g < 0.08 || g > 0.98) {
        return 0;
    }

    // Grows a little on the way out to read as leaving the page.
    return 0.14 * (1 + Math.max(0, (g - BOUNCE) / (1 - BOUNCE)) * 0.9);
}

function PadelAction() {
    const playerRef = useRef<PadelPlayerHandle>(null);
    const ballRef = useRef<Mesh>(null);
    const ballPos = useMemo(() => new Vector3(), []);
    // The racket's world position at the moment of contact, measured once.
    const contact = useRef<Vector3 | null>(null);

    const ballMaterial = useMemo(() => {
        const material = toonMaterial("#9bb36e").clone();
        material.color.set("#ffffff");
        material.map = padelBallTexture();
        return material;
    }, []);

    useFrame((state) => {
        if (!contact.current && playerRef.current) {
            // Pose the player at the hit and read where the racket actually is.
            const point = new Vector3();
            playerRef.current.applyPose(poseAt(HIT));
            playerRef.current.getRacketWorld(point);
            contact.current = point;
        }

        const g = (state.clock.elapsedTime % PERIOD) / PERIOD;

        playerRef.current?.applyPose(poseAt(g));

        if (ballRef.current && contact.current) {
            ballAt(g, contact.current, ballPos);
            ballRef.current.position.copy(ballPos);
            ballRef.current.scale.setScalar(ballScale(g));
        }
    });

    return (
        <group>
            <Court />
            <PadelPlayer ref={playerRef} />
            <mesh ref={ballRef} geometry={geometries.sphere} material={ballMaterial} />
        </group>
    );
}

export default function PadelScene({ capability }: { capability: DeviceCapability }) {
    return (
        <Stage
            camera={{ position: [-3.2, 2.3, 7], fov: 30 }}
            lookAt={[0.2, 1.55, -0.8]}
            capability={capability}
            animated
            fog={[10, 18]}
            shadow={false}
        >
            <PadelAction />
        </Stage>
    );
}
