"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { Group, Mesh, Vector3 } from "three";
import Hand from "@/components/three/Hand";
import { CLAY, INK, SAGE_DEEP, SAND, geometries, toonMaterial } from "@/components/three/toon";

/**
 * Everything the scene is allowed to say about the player. Swapping these
 * primitives for a glTF rig later means reimplementing applyPose and nothing
 * else: the scene never touches the geometry.
 */
export type PadelPose = {
    x: number;
    y: number;
    z: number;
    /** Facing, radians around Y. */
    turn: number;
    /** Forward bend of the upper body. */
    lean: number;
    /** Knee bend, 0 standing to 1 fully loaded. */
    crouch: number;
    /** Hitting shoulder, 0 arm down to 1 fully overhead and back. */
    swing: number;
    /** Elbow fold on the hitting arm. */
    elbow: number;
    /** Free arm counterbalance. */
    guard: number;
    /** Leg split during the jump. */
    stride: number;
};

export type PadelPlayerHandle = {
    applyPose: (pose: PadelPose) => void;
    /** World position of the racket face, so the ball can meet it exactly. */
    getRacketWorld: (out: Vector3) => void;
};

export const restingPose: PadelPose = {
    x: 0,
    y: 0,
    z: 0,
    turn: 0.1,
    lean: 0.16,
    crouch: 0.35,
    swing: 0.05,
    elbow: 0.3,
    guard: 0.2,
    stride: 0.12,
};

const skin = toonMaterial(CLAY);
const hair = toonMaterial(INK);
const shirt = toonMaterial("#fbfaf6");
const shorts = toonMaterial(SAGE_DEEP);
const shoes = toonMaterial(INK);
const racketFace = toonMaterial(SAND);
const racketGrip = toonMaterial(INK);

const HIP_HEIGHT = 0.95;

/** A stylised padel player built out of shared unit primitives. */
const PadelPlayer = forwardRef<PadelPlayerHandle>(function PadelPlayer(_props, ref) {
    const root = useRef<Group>(null);
    const hips = useRef<Group>(null);
    const torso = useRef<Group>(null);
    const hitShoulder = useRef<Group>(null);
    const hitElbow = useRef<Group>(null);
    const freeShoulder = useRef<Group>(null);
    const frontLeg = useRef<Group>(null);
    const backLeg = useRef<Group>(null);
    const racket = useRef<Mesh>(null);

    useImperativeHandle(ref, () => ({
        getRacketWorld(out: Vector3) {
            root.current?.updateWorldMatrix(true, true);
            racket.current?.getWorldPosition(out);
        },
        applyPose(pose: PadelPose) {
            if (!root.current || !hips.current || !torso.current) {
                return;
            }

            root.current.position.set(pose.x, pose.y, pose.z);
            root.current.rotation.y = pose.turn;

            // Crouching lowers the hips and the jump lifts the whole root.
            hips.current.position.y = HIP_HEIGHT - pose.crouch * 0.22;
            torso.current.rotation.x = pose.lean;
            torso.current.rotation.y = -pose.swing * 0.3;

            if (hitShoulder.current) {
                // 0 -> arm down, 1 -> straight up and a touch behind the head.
                hitShoulder.current.rotation.x = -pose.swing * Math.PI * 1.08;
                hitShoulder.current.rotation.z = 0.2 - pose.swing * 0.3;
            }

            if (hitElbow.current) {
                // Negative folds the forearm forward. Kept near 0 at the top so the
                // arm reaches straight up, then folded to whip the racket through.
                hitElbow.current.rotation.x = -pose.elbow * 1.7;
            }

            if (freeShoulder.current) {
                freeShoulder.current.rotation.x = -pose.guard * 1.05;
                freeShoulder.current.rotation.z = -0.22 - pose.guard * 0.2;
            }

            if (frontLeg.current) {
                frontLeg.current.rotation.x = -pose.stride - pose.crouch * 0.5;
            }

            if (backLeg.current) {
                backLeg.current.rotation.x = pose.stride * 0.8 + pose.crouch * 0.35;
            }
        },
    }));

    return (
        <group ref={root}>
            <group ref={hips} position={[0, HIP_HEIGHT, 0]}>
                {/* Hips */}
                <mesh
                    geometry={geometries.capsule}
                    material={shorts}
                    scale={[0.44, 0.2, 0.34]}
                    rotation={[0, 0, Math.PI / 2]}
                />

                <group ref={frontLeg} position={[0.11, -0.04, 0]}>
                    <mesh
                        geometry={geometries.capsule}
                        material={shorts}
                        position={[0, -0.16, 0]}
                        scale={[0.32, 0.24, 0.32]}
                    />
                    <mesh
                        geometry={geometries.capsule}
                        material={skin}
                        position={[0, -0.58, 0]}
                        scale={[0.24, 0.44, 0.24]}
                    />
                    <mesh
                        geometry={geometries.box}
                        material={shoes}
                        position={[0, -0.92, 0.05]}
                        scale={[0.17, 0.1, 0.3]}
                    />
                </group>

                <group ref={backLeg} position={[-0.11, -0.04, 0]}>
                    <mesh
                        geometry={geometries.capsule}
                        material={shorts}
                        position={[0, -0.16, 0]}
                        scale={[0.32, 0.24, 0.32]}
                    />
                    <mesh
                        geometry={geometries.capsule}
                        material={skin}
                        position={[0, -0.58, 0]}
                        scale={[0.24, 0.44, 0.24]}
                    />
                    <mesh
                        geometry={geometries.box}
                        material={shoes}
                        position={[0, -0.92, 0.05]}
                        scale={[0.17, 0.1, 0.3]}
                    />
                </group>

                <group ref={torso}>
                    <mesh
                        geometry={geometries.capsule}
                        material={shirt}
                        position={[0, 0.34, 0]}
                        scale={[0.46, 0.34, 0.36]}
                    />
                    <mesh
                        geometry={geometries.cylinder}
                        material={skin}
                        position={[0, 0.62, 0]}
                        scale={[0.14, 0.1, 0.14]}
                    />
                    <mesh
                        geometry={geometries.sphere}
                        material={skin}
                        position={[0, 0.79, 0]}
                        scale={[0.34, 0.38, 0.34]}
                    />
                    {/* Hair as a slightly larger cap, pushed back off the face */}
                    <mesh
                        geometry={geometries.sphere}
                        material={hair}
                        position={[0, 0.83, -0.02]}
                        scale={[0.36, 0.34, 0.36]}
                    />

                    <group ref={hitShoulder} position={[0.25, 0.52, 0]}>
                        <mesh
                            geometry={geometries.capsule}
                            material={skin}
                            position={[0, -0.19, 0]}
                            scale={[0.15, 0.22, 0.15]}
                        />
                        <group ref={hitElbow} position={[0, -0.38, 0]}>
                            <mesh
                                geometry={geometries.capsule}
                                material={skin}
                                position={[0, -0.17, 0]}
                                scale={[0.13, 0.2, 0.13]}
                            />
                            {/* Hand gripping the handle */}
                            <group position={[0, -0.36, 0.02]} rotation={[Math.PI / 2, 0, 0]} scale={0.85}>
                                <Hand material={skin} side={1} />
                            </group>
                            <mesh
                                geometry={geometries.cylinder}
                                material={racketGrip}
                                position={[0, -0.42, 0]}
                                scale={[0.055, 0.2, 0.055]}
                            />
                            <mesh
                                ref={racket}
                                geometry={geometries.sphere}
                                material={racketFace}
                                position={[0, -0.68, 0]}
                                scale={[0.36, 0.46, 0.07]}
                            />
                        </group>
                    </group>

                    <group ref={freeShoulder} position={[-0.25, 0.52, 0]}>
                        <mesh
                            geometry={geometries.capsule}
                            material={skin}
                            position={[0, -0.17, 0]}
                            scale={[0.15, 0.2, 0.15]}
                        />
                        <mesh
                            geometry={geometries.capsule}
                            material={skin}
                            position={[0, -0.46, 0]}
                            scale={[0.13, 0.19, 0.13]}
                        />
                        {/* Free hand */}
                        <group position={[0, -0.64, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.85}>
                            <Hand material={skin} side={-1} />
                        </group>
                    </group>
                </group>
            </group>
        </group>
    );
});

export default PadelPlayer;
