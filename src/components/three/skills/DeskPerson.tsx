"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { Group } from "three";
import Hand from "@/components/three/Hand";
import { CLAY, INK, geometries, toonMaterial } from "@/components/three/toon";

export type DeskPose = {
    /** Typing cycle in radians. */
    phase: number;
    /** Small idle sway of the upper body. */
    sway: number;
};

export type DeskPersonHandle = {
    applyPose: (pose: DeskPose) => void;
};

const skin = toonMaterial(CLAY);
const hair = toonMaterial(INK);
const top = toonMaterial("#7d9268");

const SEAT_Y = 0.52;

/** A forearm resting on the desk with a hand on the keyboard. */
function Arm({
    side,
    handRef,
}: {
    side: 1 | -1;
    handRef: React.RefObject<Group | null>;
}) {
    return (
        <group>
            {/* Upper arm: short link from the shoulder to the elbow. */}
            <mesh
                geometry={geometries.capsule}
                material={top}
                position={[side * 0.26, 0.12, -0.17]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[0.1, 0.14, 0.1]}
            />
            {/* Forearm: lies forward along the desk toward the keyboard. */}
            <mesh
                geometry={geometries.capsule}
                material={skin}
                position={[side * 0.23, 0.1, -0.44]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={[0.09, 0.2, 0.09]}
            />
            {/* Five-fingered hand, fingers on the keys, bobbing while typing. */}
            <group ref={handRef} position={[side * 0.22, 0.1, -0.6]}>
                <Hand material={skin} side={side} />
            </group>
        </group>
    );
}

/** Seen from above: head, shoulders and the hands doing the work. */
const DeskPerson = forwardRef<DeskPersonHandle>(function DeskPerson(_props, ref) {
    const torso = useRef<Group>(null);
    const leftHand = useRef<Group>(null);
    const rightHand = useRef<Group>(null);

    useImperativeHandle(ref, () => ({
        applyPose(pose: DeskPose) {
            if (torso.current) {
                torso.current.rotation.z = Math.sin(pose.sway) * 0.02;
                torso.current.position.y = SEAT_Y + Math.sin(pose.sway * 1.3) * 0.006;
            }

            // Hands alternate with a short travel, so it reads as typing rather
            // than drumming, and the offset keeps the two out of phase.
            if (leftHand.current) {
                leftHand.current.position.y = 0.1 + Math.max(0, Math.sin(pose.phase)) * 0.03;
            }

            if (rightHand.current) {
                rightHand.current.position.y =
                    0.1 + Math.max(0, Math.sin(pose.phase * 1.15 + 1.9)) * 0.03;
            }
        },
    }));

    return (
        <group position={[0, 0.16, 0.95]}>
            <group ref={torso} position={[0, SEAT_Y, 0]}>
                <mesh
                    geometry={geometries.capsule}
                    material={top}
                    position={[0, 0.16, 0]}
                    scale={[0.64, 0.28, 0.46]}
                />
                <mesh
                    geometry={geometries.cylinder}
                    material={skin}
                    position={[0, 0.36, -0.02]}
                    scale={[0.13, 0.1, 0.13]}
                />
                <mesh
                    geometry={geometries.sphere}
                    material={skin}
                    position={[0, 0.5, -0.04]}
                    scale={[0.36, 0.4, 0.36]}
                />
                <mesh
                    geometry={geometries.sphere}
                    material={hair}
                    position={[0, 0.53, -0.06]}
                    scale={[0.38, 0.37, 0.38]}
                />
            </group>

            {/* Shoulders sit at the torso top; the arms reach out from there. */}
            <group position={[0, SEAT_Y + 0.16, 0]}>
                <Arm side={-1} handRef={leftHand} />
                <Arm side={1} handRef={rightHand} />
            </group>
        </group>
    );
});

export default DeskPerson;
