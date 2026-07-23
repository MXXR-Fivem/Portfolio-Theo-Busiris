"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { Group } from "three";
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
const chair = toonMaterial("#4b4f46");

const SEAT_Y = 0.52;
const HAND_Y = 0.86;

/** Seen from above: the head, the shoulders and the hands doing the work. */
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

            // Hands alternate, with a short travel so it reads as typing
            // rather than as drumming.
            if (leftHand.current) {
                leftHand.current.position.y =
                    HAND_Y + Math.max(0, Math.sin(pose.phase)) * 0.035;
            }

            if (rightHand.current) {
                rightHand.current.position.y =
                    HAND_Y + Math.max(0, Math.sin(pose.phase * 1.15 + 1.9)) * 0.035;
            }
        },
    }));

    return (
        <group position={[0, 0, 0.95]}>
            {/* Chair back, just enough to read as a seat from above */}
            <mesh
                geometry={geometries.box}
                material={chair}
                position={[0, 0.62, 0.34]}
                scale={[0.62, 0.5, 0.08]}
            />

            <group ref={torso} position={[0, SEAT_Y, 0]}>
                <mesh
                    geometry={geometries.capsule}
                    material={top}
                    position={[0, 0.16, 0]}
                    scale={[0.62, 0.26, 0.44]}
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

                {/* Forearms angled in towards the keyboard */}
                {[-1, 1].map((side) => (
                    <mesh
                        key={`arm-${side}`}
                        geometry={geometries.capsule}
                        material={skin}
                        position={[side * 0.23, 0.2, -0.36]}
                        rotation={[1.45, 0, side * 0.14]}
                        scale={[0.14, 0.32, 0.14]}
                    />
                ))}
            </group>

            <group ref={leftHand} position={[-0.22, HAND_Y, -0.76]}>
                <mesh geometry={geometries.box} material={skin} scale={[0.17, 0.06, 0.2]} />
            </group>
            <group ref={rightHand} position={[0.22, HAND_Y, -0.76]}>
                <mesh geometry={geometries.box} material={skin} scale={[0.17, 0.06, 0.2]} />
            </group>
        </group>
    );
});

export default DeskPerson;
