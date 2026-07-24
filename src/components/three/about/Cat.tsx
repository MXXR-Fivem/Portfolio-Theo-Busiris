"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import type { Group } from "three";
import { geometries, toonMaterial } from "@/components/three/toon";

export type CatPose = {
    x: number;
    z: number;
    /** Walk cycle in radians; legs alternate on it. */
    phase: number;
};

export type CatHandle = {
    applyPose: (pose: CatPose) => void;
};

type CatProps = {
    coat: string;
    belly: string;
    /** Small differences keep the pair from reading as a copy-paste. */
    scale?: number;
    /** Tail colour, when it differs from the coat (the white cat's grey tail). */
    tail?: string;
    /** A short tail is a single segment instead of a curved two-piece one. */
    shortTail?: boolean;
    /** Lighter banding painted over the back, for the tabby. */
    stripes?: string;
    /** Dark patch on one side of the head; +1 is the camera-facing side. */
    headPatch?: { color: string; side: 1 | -1 };
};

/** Standing height of the body group; the walk bob is added on top of it. */
const BODY_HEIGHT = 0.54;

const nose = toonMaterial("#b98a7f");
const eye = toonMaterial("#2b2e2a");

/** A stylised cat, sized in the same units as the rest of the scenes. */
const Cat = forwardRef<CatHandle, CatProps>(function Cat(
    { coat, belly, scale = 1, tail, shortTail = false, stripes, headPatch },
    ref
) {
    const root = useRef<Group>(null);
    const body = useRef<Group>(null);
    const tailGroup = useRef<Group>(null);
    const legs = [
        useRef<Group>(null),
        useRef<Group>(null),
        useRef<Group>(null),
        useRef<Group>(null),
    ];

    const coatMaterial = useMemo(() => toonMaterial(coat), [coat]);
    const bellyMaterial = useMemo(() => toonMaterial(belly), [belly]);
    const tailMaterial = useMemo(() => toonMaterial(tail ?? coat), [tail, coat]);
    const stripeMaterial = useMemo(
        () => (stripes ? toonMaterial(stripes) : null),
        [stripes]
    );
    const patchMaterial = useMemo(
        () => (headPatch ? toonMaterial(headPatch.color) : null),
        [headPatch]
    );

    useImperativeHandle(ref, () => ({
        applyPose(pose: CatPose) {
            if (!root.current || !body.current) {
                return;
            }

            root.current.position.x = pose.x;
            root.current.position.z = pose.z;

            // Diagonal pairs, the way a cat actually walks.
            const swing = Math.sin(pose.phase);
            const offbeat = Math.sin(pose.phase + Math.PI);

            legs[0].current && (legs[0].current.rotation.z = swing * 0.34);
            legs[3].current && (legs[3].current.rotation.z = swing * 0.3);
            legs[1].current && (legs[1].current.rotation.z = offbeat * 0.3);
            legs[2].current && (legs[2].current.rotation.z = offbeat * 0.34);

            body.current.position.y = BODY_HEIGHT + Math.abs(Math.sin(pose.phase)) * 0.025;
            body.current.rotation.z = swing * 0.03;

            if (tailGroup.current) {
                tailGroup.current.rotation.z = 0.5 + Math.sin(pose.phase * 0.5) * 0.18;
                tailGroup.current.rotation.y = Math.sin(pose.phase * 0.33) * 0.25;
            }
        },
    }));

    // Tabby bands wrapped across the back at intervals along the body.
    const stripeBands = stripeMaterial
        ? [-0.2, -0.08, 0.04, 0.16].map((x) => (
              <mesh
                  key={`stripe-${x}`}
                  geometry={geometries.box}
                  material={stripeMaterial}
                  position={[x, 0.02, 0]}
                  scale={[0.045, 0.345, 0.345]}
              />
          ))
        : null;

    return (
        <group ref={root} scale={scale}>
            <group ref={body} position={[0, BODY_HEIGHT, 0]}>
                <mesh
                    geometry={geometries.capsule}
                    material={coatMaterial}
                    rotation={[0, 0, Math.PI / 2]}
                    scale={[0.32, 0.34, 0.32]}
                />
                {stripeBands}
                <mesh
                    geometry={geometries.capsule}
                    material={bellyMaterial}
                    position={[0, -0.07, 0]}
                    rotation={[0, 0, Math.PI / 2]}
                    scale={[0.22, 0.28, 0.26]}
                />
                {/* Bib under the neck, toward the head end. */}
                <mesh
                    geometry={geometries.sphere}
                    material={bellyMaterial}
                    position={[0.28, -0.02, 0]}
                    scale={[0.18, 0.16, 0.2]}
                />

                {/* Head */}
                <group position={[0.4, 0.2, 0]}>
                    <mesh
                        geometry={geometries.sphere}
                        material={coatMaterial}
                        scale={[0.34, 0.33, 0.33]}
                    />
                    {patchMaterial && headPatch ? (
                        <mesh
                            geometry={geometries.sphere}
                            material={patchMaterial}
                            position={[0.05, -0.01, headPatch.side * 0.2]}
                            scale={[0.24, 0.26, 0.2]}
                        />
                    ) : null}
                    <mesh
                        geometry={geometries.sphere}
                        material={bellyMaterial}
                        position={[0.11, -0.06, 0]}
                        scale={[0.16, 0.13, 0.17]}
                    />
                    <mesh
                        geometry={geometries.sphere}
                        material={nose}
                        position={[0.17, -0.04, 0]}
                        scale={[0.05, 0.04, 0.05]}
                    />
                    {[-1, 1].map((side) => (
                        <mesh
                            key={`ear-${side}`}
                            geometry={geometries.cone}
                            material={coatMaterial}
                            position={[-0.02, 0.2, side * 0.1]}
                            scale={[0.16, 0.2, 0.11]}
                        />
                    ))}
                    {[-1, 1].map((side) => (
                        <mesh
                            key={`eye-${side}`}
                            geometry={geometries.sphere}
                            material={eye}
                            position={[0.12, 0.05, side * 0.1]}
                            scale={[0.05, 0.06, 0.05]}
                        />
                    ))}
                </group>

                {/* Tail: one stub for a short tail, otherwise a curved two-piece. */}
                <group ref={tailGroup} position={[-0.36, 0.06, 0]}>
                    <mesh
                        geometry={geometries.capsule}
                        material={tailMaterial}
                        position={[-0.08, 0.08, 0]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[0.08, shortTail ? 0.14 : 0.18, 0.08]}
                    />
                    {shortTail ? null : (
                        <mesh
                            geometry={geometries.capsule}
                            material={tailMaterial}
                            position={[-0.2, 0.3, 0]}
                            rotation={[0, 0, Math.PI / 8]}
                            scale={[0.07, 0.16, 0.07]}
                        />
                    )}
                </group>
            </group>

            {[
                [0.24, 0.12],
                [0.24, -0.12],
                [-0.24, 0.12],
                [-0.24, -0.12],
            ].map(([x, z], index) => (
                <group
                    key={`leg-${index}`}
                    ref={legs[index]}
                    position={[x, 0.46, z]}
                >
                    <mesh
                        geometry={geometries.capsule}
                        material={coatMaterial}
                        position={[0, -0.2, 0]}
                        scale={[0.12, 0.22, 0.12]}
                    />
                </group>
            ))}
        </group>
    );
});

export default Cat;
