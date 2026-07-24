"use client";

import type { MeshToonMaterial } from "three";
import { INK, SAND, geometries, toonMaterial } from "@/components/three/toon";

const top = toonMaterial("#e8dfcc");
const legMat = toonMaterial("#c2b49a");
const shell = toonMaterial(INK);
const keyBase = toonMaterial("#3a3d38");
const keyCap = toonMaterial("#d8d2c4");
const mouseMat = toonMaterial("#2f322e");
const mug = toonMaterial("#9caf88");
const paper = toonMaterial(SAND);
const seatMat = toonMaterial("#4b4f46");
const metal = toonMaterial("#6b6f68");

const DESK_Y = 0.75;

/** One monitor: bezel plus the shared, light-reactive screen face. */
function Monitor({ screenMaterial }: { screenMaterial: MeshToonMaterial }) {
    return (
        <group>
            <mesh
                geometry={geometries.box}
                material={shell}
                position={[0, 0.05, 0]}
                scale={[0.3, 0.03, 0.2]}
            />
            <mesh
                geometry={geometries.box}
                material={shell}
                position={[0, 0.22, -0.02]}
                scale={[0.07, 0.3, 0.07]}
            />
            <group position={[0, 0.58, 0.02]} rotation={[-0.22, 0, 0]}>
                <mesh geometry={geometries.box} material={shell} scale={[0.94, 0.6, 0.05]} />
                <mesh
                    geometry={geometries.plane}
                    material={screenMaterial}
                    position={[0, 0, 0.03]}
                    scale={[0.86, 0.52, 1]}
                />
            </group>
        </group>
    );
}

/** Office chair, seen mostly as the backrest and armrests behind the sitter. */
function Chair() {
    return (
        <group position={[0, 0, 1.08]}>
            <mesh geometry={geometries.box} material={seatMat} position={[0, 0.42, 0]} scale={[0.64, 0.09, 0.58]} />
            <mesh
                geometry={geometries.box}
                material={seatMat}
                position={[0, 0.82, 0.3]}
                rotation={[-0.14, 0, 0]}
                scale={[0.62, 0.72, 0.1]}
            />
            {[-1, 1].map((side) => (
                <mesh
                    key={`arm-${side}`}
                    geometry={geometries.box}
                    material={seatMat}
                    position={[side * 0.36, 0.52, -0.02]}
                    scale={[0.08, 0.07, 0.42]}
                />
            ))}
            <mesh geometry={geometries.cylinder} material={metal} position={[0, 0.2, 0]} scale={[0.09, 0.42, 0.09]} />
            {/* Five-star base with casters. */}
            {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i / 5) * Math.PI * 2;
                const x = Math.sin(angle) * 0.3;
                const z = Math.cos(angle) * 0.3;
                return (
                    <group key={`caster-${i}`}>
                        <mesh
                            geometry={geometries.box}
                            material={metal}
                            position={[x / 2, 0.04, z / 2]}
                            rotation={[0, -angle, 0]}
                            scale={[0.06, 0.05, 0.32]}
                        />
                        <mesh geometry={geometries.sphere} material={shell} position={[x, 0.03, z]} scale={0.07} />
                    </group>
                );
            })}
        </group>
    );
}

/** Desk, dual monitors, keyboard, mouse, props and chair. */
export default function Desk({ screenMaterial }: { screenMaterial: MeshToonMaterial }) {
    return (
        <group>
            <mesh geometry={geometries.box} material={top} position={[0, DESK_Y, 0]} scale={[2.7, 0.07, 1.3]} />

            {[
                [-1.2, 0.52],
                [1.2, 0.52],
                [-1.2, -0.52],
                [1.2, -0.52],
            ].map(([x, z]) => (
                <mesh
                    key={`${x}-${z}`}
                    geometry={geometries.box}
                    material={legMat}
                    position={[x, DESK_Y / 2, z]}
                    scale={[0.07, DESK_Y, 0.07]}
                />
            ))}

            {/* Centre monitor, straight on. */}
            <group position={[-0.18, DESK_Y + 0.04, -0.44]}>
                <Monitor screenMaterial={screenMaterial} />
            </group>
            {/* Second monitor clear to the right, angled in toward the sitter. */}
            <group position={[0.82, DESK_Y + 0.04, -0.4]} rotation={[0, -0.55, 0]}>
                <Monitor screenMaterial={screenMaterial} />
            </group>

            {/* Keyboard: dark base with a plate of keycaps. */}
            <group position={[-0.05, DESK_Y + 0.04, 0.26]}>
                <mesh geometry={geometries.box} material={keyBase} scale={[0.86, 0.05, 0.3]} />
                <mesh geometry={geometries.box} material={keyCap} position={[0, 0.03, 0]} scale={[0.8, 0.02, 0.24]} />
                {[-0.09, -0.03, 0.03, 0.09].map((z) => (
                    <mesh
                        key={`row-${z}`}
                        geometry={geometries.box}
                        material={keyBase}
                        position={[0, 0.045, z]}
                        scale={[0.78, 0.01, 0.008]}
                    />
                ))}
            </group>

            {/* Mouse to the right of the keyboard. */}
            <mesh
                geometry={geometries.sphere}
                material={mouseMat}
                position={[0.62, DESK_Y + 0.06, 0.28]}
                scale={[0.1, 0.055, 0.15]}
            />

            <mesh
                geometry={geometries.cylinder}
                material={mug}
                position={[0.92, DESK_Y + 0.11, 0.12]}
                scale={[0.14, 0.19, 0.14]}
            />
            <mesh
                geometry={geometries.box}
                material={paper}
                position={[-0.92, DESK_Y + 0.05, 0.18]}
                rotation={[0, 0.22, 0]}
                scale={[0.4, 0.03, 0.3]}
            />

            <Chair />
        </group>
    );
}
