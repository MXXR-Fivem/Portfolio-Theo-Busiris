"use client";

import type { MeshToonMaterial } from "three";
import { INK, geometries, toonMaterial } from "@/components/three/toon";

const top = toonMaterial("#e8dfcc");
const legMat = toonMaterial("#c2b49a");
const shell = toonMaterial(INK);
const keyBase = toonMaterial("#3a3d38");
const keyCap = toonMaterial("#d8d2c4");
const mouseMat = toonMaterial("#2f322e");
const wheelMat = toonMaterial("#9a9e98");
const mug = toonMaterial("#9caf88");
const seatMat = toonMaterial("#4b4f46");
const metal = toonMaterial("#6b6f68");

const DESK_Y = 0.75;

const SCREEN_WIDTH = 0.94;
/** Bezel-to-bezel clearance, so the two panels meet without z-fighting. */
const SCREEN_GAP = 0.005;
/** How far the second screen is swung back in toward the sitter. */
const SCREEN_ANGLE = 0.5;
/** The main screen sits dead centre on the desk. */
const MAIN_Z = -0.48;

// The second screen is hinged off the main one's right edge: swing a panel of
// the same width out from that edge by SCREEN_ANGLE and this is where its
// centre lands. Doing the trigonometry means the inner bezels stay touching
// and level at any angle, instead of leaving a wedge of daylight between them.
const HINGE = SCREEN_WIDTH / 2 + SCREEN_GAP;
const SECOND_X = SCREEN_WIDTH / 2 + HINGE * Math.cos(SCREEN_ANGLE);
const SECOND_Z = MAIN_Z + HINGE * Math.sin(SCREEN_ANGLE);

/** Back-left corner of the desk, with the arm swung in toward the middle. */
const LAMP_BASE: [number, number, number] = [-1.05, DESK_Y + 0.04, -0.42];
/** Yaw that points the arm, and so the shade, at the centre of the desk. */
const LAMP_YAW = 0.44;

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
                <mesh
                    geometry={geometries.box}
                    material={shell}
                    scale={[SCREEN_WIDTH, 0.6, 0.05]}
                />
                <mesh
                    geometry={geometries.plane}
                    material={screenMaterial}
                    position={[0, 0, 0.03]}
                    scale={[SCREEN_WIDTH - 0.08, 0.52, 1]}
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

const lampBody = toonMaterial("#3f4a44");

/**
 * The desk lamp, standing in the back-left corner with its arm swung in so the
 * shade hangs over the middle of the desk and throws its light that way. The
 * bulb glows once the scene turns to night.
 */
function DeskLamp({ shadeMaterial }: { shadeMaterial: MeshToonMaterial }) {
    return (
        <group position={LAMP_BASE} rotation={[0, -LAMP_YAW, 0]}>
            <mesh geometry={geometries.cylinder} material={lampBody} position={[0, 0.02, 0]} scale={[0.18, 0.04, 0.18]} />
            <mesh geometry={geometries.cylinder} material={lampBody} position={[0, 0.27, 0]} scale={[0.04, 0.5, 0.04]} />
            {/* Arm reaching out over the desk toward the centre. */}
            <mesh
                geometry={geometries.cylinder}
                material={lampBody}
                position={[0.21, 0.53, 0]}
                rotation={[0, 0, -1.4]}
                scale={[0.035, 0.44, 0.035]}
            />
            {/* Shade tipped in toward the middle, bulb at the opening. */}
            <group position={[0.42, 0.45, 0]} rotation={[0, 0, 0.26]}>
                <mesh geometry={geometries.cone} material={lampBody} scale={0.24} />
                <mesh
                    geometry={geometries.sphere}
                    material={shadeMaterial}
                    position={[0, -0.11, 0]}
                    scale={[0.14, 0.09, 0.14]}
                />
            </group>
        </group>
    );
}

/** Desk, dual monitors, keyboard, mouse, props, lamp and chair. */
export default function Desk({
    screenMaterial,
    lampMaterial,
}: {
    screenMaterial: MeshToonMaterial;
    lampMaterial: MeshToonMaterial;
}) {
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

            {/* Main screen square in the middle of the desk; the second hinged
                off its right edge, level with it and angled in at the sitter. */}
            <group position={[0, DESK_Y + 0.04, MAIN_Z]}>
                <Monitor screenMaterial={screenMaterial} />
            </group>
            <group
                position={[SECOND_X, DESK_Y + 0.04, SECOND_Z]}
                rotation={[0, -SCREEN_ANGLE, 0]}
            >
                <Monitor screenMaterial={screenMaterial} />
            </group>

            {/* Keyboard: dark base with a plate of keycaps, square to the main
                screen it belongs to. */}
            <group position={[0, DESK_Y + 0.04, 0.26]}>
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

            {/* Mouse to the right of the keyboard, grey scroll wheel set into
                the front of the shell. */}
            <group position={[0.64, DESK_Y + 0.06, 0.28]}>
                <mesh geometry={geometries.sphere} material={mouseMat} scale={[0.1, 0.055, 0.15]} />
                <mesh
                    geometry={geometries.cylinder}
                    material={wheelMat}
                    position={[0, 0.016, -0.034]}
                    rotation={[0, 0, Math.PI / 2]}
                    scale={[0.042, 0.014, 0.042]}
                />
            </group>

            <mesh
                geometry={geometries.cylinder}
                material={mug}
                position={[0.92, DESK_Y + 0.11, 0.12]}
                scale={[0.14, 0.19, 0.14]}
            />
            <DeskLamp shadeMaterial={lampMaterial} />
            <Chair />
        </group>
    );
}
