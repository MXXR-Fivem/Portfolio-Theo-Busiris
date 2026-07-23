"use client";

import { forwardRef, useMemo } from "react";
import type { Mesh } from "three";
import { INK, SAND, geometries, toonMaterial } from "@/components/three/toon";

const top = toonMaterial("#e8dfcc");
const legs = toonMaterial("#c2b49a");
const shell = toonMaterial(INK);
const keys = toonMaterial("#d8d2c4");
const mug = toonMaterial("#9caf88");
const paper = toonMaterial(SAND);

const DESK_Y = 0.75;

/** Desk, screen and props. The screen face is exposed so its glow can react. */
const Desk = forwardRef<Mesh>(function Desk(_props, screenRef) {
    // Cloned rather than shared: the scene mutates this one's emissive to turn
    // the screen into the dominant light source at night.
    const panel = useMemo(() => toonMaterial("#cdd9de").clone(), []);

    return (
        <group>
            <mesh
                geometry={geometries.box}
                material={top}
                position={[0, DESK_Y, 0]}
                scale={[2.5, 0.07, 1.3]}
            />

            {[
                [-1.1, 0.52],
                [1.1, 0.52],
                [-1.1, -0.52],
                [1.1, -0.52],
            ].map(([x, z]) => (
                <mesh
                    key={`${x}-${z}`}
                    geometry={geometries.box}
                    material={legs}
                    position={[x, DESK_Y / 2, z]}
                    scale={[0.07, DESK_Y, 0.07]}
                />
            ))}

            {/* Monitor */}
            <group position={[0, DESK_Y + 0.04, -0.42]}>
                <mesh
                    geometry={geometries.box}
                    material={shell}
                    position={[0, 0.05, 0]}
                    scale={[0.34, 0.03, 0.22]}
                />
                <mesh
                    geometry={geometries.box}
                    material={shell}
                    position={[0, 0.22, -0.02]}
                    scale={[0.07, 0.3, 0.07]}
                />
                <group position={[0, 0.62, 0.02]} rotation={[-0.22, 0, 0]}>
                    <mesh
                        geometry={geometries.box}
                        material={shell}
                        scale={[1.42, 0.82, 0.05]}
                    />
                    <mesh
                        ref={screenRef}
                        geometry={geometries.plane}
                        material={panel}
                        position={[0, 0, 0.03]}
                        scale={[1.32, 0.72, 1]}
                    />
                </group>
            </group>

            {/* Keyboard and props */}
            <mesh
                geometry={geometries.box}
                material={keys}
                position={[0, DESK_Y + 0.05, 0.24]}
                scale={[0.92, 0.04, 0.28]}
            />
            <mesh
                geometry={geometries.cylinder}
                material={mug}
                position={[0.82, DESK_Y + 0.11, 0.16]}
                scale={[0.16, 0.19, 0.16]}
            />
            <mesh
                geometry={geometries.box}
                material={paper}
                position={[-0.86, DESK_Y + 0.05, 0.2]}
                rotation={[0, 0.22, 0]}
                scale={[0.42, 0.03, 0.3]}
            />
        </group>
    );
});

export default Desk;
