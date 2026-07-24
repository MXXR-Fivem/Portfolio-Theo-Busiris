"use client";

import type { Material } from "three";
import { geometries } from "@/components/three/toon";

/**
 * A small five-fingered hand: palm plus four fingers and a thumb, the fingers
 * pointing along -Z. Kept generic so the padel player and the desk figure can
 * both reuse it at their own scale and material.
 */
export default function Hand({
    material,
    side = 1,
}: {
    material: Material;
    /** Which way the thumb splays; +1 is the outer side. */
    side?: 1 | -1;
}) {
    return (
        <group>
            <mesh geometry={geometries.box} material={material} scale={[0.13, 0.05, 0.11]} />
            {[-0.045, -0.015, 0.015, 0.045].map((x) => (
                <mesh
                    key={x}
                    geometry={geometries.capsule}
                    material={material}
                    position={[x, 0, -0.1]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[0.018, 0.055, 0.018]}
                />
            ))}
            <mesh
                geometry={geometries.capsule}
                material={material}
                position={[side * 0.07, 0, -0.01]}
                rotation={[Math.PI / 2, 0, side * 0.7]}
                scale={[0.02, 0.045, 0.02]}
            />
        </group>
    );
}
