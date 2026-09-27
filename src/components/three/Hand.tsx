"use client";

import type { Material } from "three";
import { geometries } from "@/components/three/toon";

/**
 * Index to little finger: where each one sits across the knuckles and how long
 * its first bone is. Unequal lengths are most of what stops four capsules side
 * by side from reading as a paddle.
 */
const FINGERS = [
    { x: -0.048, length: 0.025 },
    { x: -0.016, length: 0.028 },
    { x: 0.016, length: 0.026 },
    { x: 0.048, length: 0.021 },
];

/** Finger diameter. Thin enough to read as a digit, thick enough to survive the
 *  distance the camera actually sits at. */
const BONE = 0.031;

/**
 * A small five-fingered hand: palm, four two-boned fingers and a thumb, the
 * fingers pointing along -Z and folding toward -Y. Kept generic so the padel
 * player and the desk figure can both reuse it at their own scale, material and
 * amount of grip.
 */
export default function Hand({
    material,
    side = 1,
    curl = 0,
}: {
    material: Material;
    /** Which way the thumb splays; +1 is the outer side. */
    side?: 1 | -1;
    /** 0 flat and open, 1 closed around a handle. */
    curl?: number;
}) {
    return (
        <group>
            <mesh geometry={geometries.box} material={material} scale={[0.135, 0.055, 0.1]} />
            {FINGERS.map((finger, index) => {
                // The outer fingers close further than the index does, so a
                // closed hand keeps a visible stagger instead of one flat front.
                const fold = curl * (1 + index * 0.14);

                return (
                    <group
                        key={finger.x}
                        position={[finger.x, 0.002, -0.05]}
                        rotation={[-fold * 1.15, 0, side * (index - 1.5) * 0.045]}
                    >
                        <mesh
                            geometry={geometries.capsule}
                            material={material}
                            position={[0, 0, -finger.length]}
                            rotation={[Math.PI / 2, 0, 0]}
                            scale={[BONE, finger.length, BONE]}
                        />
                        {/* Second bone, folding further than the first. */}
                        <group
                            position={[0, 0, -finger.length * 2]}
                            rotation={[-fold * 1.3, 0, 0]}
                        >
                            <mesh
                                geometry={geometries.capsule}
                                material={material}
                                position={[0, 0, -finger.length * 0.78]}
                                rotation={[Math.PI / 2, 0, 0]}
                                scale={[BONE * 0.88, finger.length * 0.78, BONE * 0.88]}
                            />
                        </group>
                    </group>
                );
            })}
            {/* Thumb: splayed when the hand is open, laid across the fingers as
                it closes, which is what makes a grip read as a grip. */}
            <group
                position={[side * 0.062, 0.004, -0.014]}
                rotation={[-curl * 0.55, side * (0.3 + curl * 0.55), side * (0.6 - curl * 0.25)]}
            >
                <mesh
                    geometry={geometries.capsule}
                    material={material}
                    position={[0, 0, -0.026]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[BONE * 1.05, 0.026, BONE * 1.05]}
                />
                <group position={[0, 0, -0.052]} rotation={[-curl * 0.5, 0, 0]}>
                    <mesh
                        geometry={geometries.capsule}
                        material={material}
                        position={[0, 0, -0.021]}
                        rotation={[Math.PI / 2, 0, 0]}
                        scale={[BONE * 0.95, 0.021, BONE * 0.95]}
                    />
                </group>
            </group>
        </group>
    );
}
