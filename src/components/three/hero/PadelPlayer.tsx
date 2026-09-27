"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { MeshBasicMaterial, SRGBColorSpace, TextureLoader } from "three";
import type { Group, Mesh, Vector3 } from "three";
import Hand from "@/components/three/Hand";
import {
    CLAY,
    INK,
    RACKET_NECK,
    SAGE,
    SAGE_DEEP,
    geometries,
    padelFace,
    padelFrame,
    toonMaterial,
} from "@/components/three/toon";

/**
 * Everything the scene is allowed to say about the player. Swapping these
 * primitives for a glTF rig later means reimplementing applyPose and nothing
 * else: the scene never touches the geometry.
 *
 * The joints are ordered the way the force travels through a real swing:
 * legs, hips, spine, shoulder, elbow, wrist. Driving them in that order, each
 * a beat behind the last, is what stops the body moving as one rigid block.
 */
export type PadelPose = {
    x: number;
    y: number;
    z: number;
    /** Facing of the hips, radians around Y. */
    turn: number;
    /** Shoulders relative to the hips: the separation a swing is built on. */
    twist: number;
    /** Forward bend of the upper body. */
    lean: number;
    /** Sideways bend of the spine, away from the hitting arm. */
    sideLean: number;
    /** Knee bend, 0 standing to 1 fully loaded. */
    crouch: number;
    /** Hitting shoulder, 0 arm down to 1 fully overhead and back. */
    swing: number;
    /** Elbow fold on the hitting arm. */
    elbow: number;
    /** Wrist snap at the end of the chain, negative cocked back. */
    wrist: number;
    /** Free arm counterbalance. */
    guard: number;
    /** Leg split during the jump. */
    stride: number;
    /** Head pitch: negative watches the lob, positive follows it down. */
    look: number;
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
    turn: 0.12,
    twist: 0.02,
    lean: 0.16,
    sideLean: 0.02,
    crouch: 0.32,
    swing: 0.06,
    elbow: 0.32,
    wrist: 0.1,
    guard: 0.22,
    stride: 0.12,
    look: 0.05,
};

const skin = toonMaterial(CLAY);
const hair = toonMaterial(INK);
const shirt = toonMaterial("#fbfaf6");
const shorts = toonMaterial(SAGE_DEEP);
const shoes = toonMaterial(INK);
const grip = toonMaterial(INK);
const racketFrame = toonMaterial(SAGE);
/** Darker than INK on purpose: the holes are only bright dots if what sits
 *  behind them is the darkest thing on the racket. */
const racketFace = toonMaterial("#1f221d");

/**
 * The club badge on the shirt, as a decal rather than as part of the shirt's
 * own material: a plane sitting a hair proud of the chest keeps the mark
 * square and legible, where a texture wrapped round the torso capsule would
 * bend it around the ribs.
 *
 * Unlit on purpose. It stands for print on fabric, and print does not catch
 * the key light the way the cloth under it does.
 */
function useBadge() {
    return useMemo(() => {
        const material = new MeshBasicMaterial({
            transparent: true,
            depthWrite: false,
            // Hidden until the texture lands, so the first frames never show a
            // blank white square sitting on a white shirt.
            opacity: 0,
        });

        new TextureLoader().load("/vibaura-mark.png", (map) => {
            map.colorSpace = SRGBColorSpace;
            material.map = map;
            material.opacity = 1;
            material.needsUpdate = true;
        });

        return material;
    }, []);
}

const HIP_HEIGHT = 0.95;
/** Distance from the wrist joint down to the centre of the racket face. Long
 *  enough that a stretch of bare grip shows below the hand, without which the
 *  racket reads as growing straight out of the arm. */
const RACKET_DROP = 0.42;

type LegRefs = {
    hip: React.RefObject<Group | null>;
    knee: React.RefObject<Group | null>;
    foot: React.RefObject<Group | null>;
};

/** Thigh, shin and a foot that keeps itself flat on the court. */
function Leg({ x, refs }: { x: number; refs: LegRefs }) {
    return (
        <group ref={refs.hip} position={[x, -0.04, 0]}>
            <mesh
                geometry={geometries.capsule}
                material={shorts}
                position={[0, -0.16, 0]}
                scale={[0.32, 0.24, 0.32]}
            />
            {/* The bare thigh below the hem stays with the hip. It used to be
                the top of the shin, which turns with the knee: bent, that
                stretch of skin swung out through the front of the shorts. */}
            <mesh
                geometry={geometries.capsule}
                material={skin}
                position={[0, -0.33, 0]}
                scale={[0.24, 0.14, 0.24]}
            />
            <group ref={refs.knee} position={[0, -0.42, 0]}>
                {/* A ball at the joint, so the shin can turn without a corner. */}
                <mesh geometry={geometries.sphere} material={skin} scale={0.24} />
                <mesh
                    geometry={geometries.capsule}
                    material={skin}
                    position={[0, -0.31, 0]}
                    scale={[0.24, 0.29, 0.24]}
                />
                <group ref={refs.foot} position={[0, -0.55, 0]}>
                    {/* A sphere, not a box or a capsule: the ankle already
                        swings this through a wide arc over the jump, and a
                        capsule needs a 90° mount of its own to lie flat at
                        rest, which then stacks with that swing and rotates
                        the shoe past its own foreshortening point — at the
                        top of the jump it was end-on to the camera and read
                        as a sliver. A sphere has no long axis to foreshorten,
                        so it reads as a shoe at any ankle angle.
                        Large and only lightly forward of the ankle: pulled
                        much forward with a small radius it tapered to a
                        point behind the ankle and read as a slipper open at
                        the heel, not a shoe closed around it. */}
                    <mesh
                        geometry={geometries.sphere}
                        material={shoes}
                        position={[0, 0, 0.06]}
                        scale={[0.22, 0.16, 0.4]}
                    />
                </group>
            </group>
        </group>
    );
}

/** A stylised padel player built out of shared unit primitives. */
const PadelPlayer = forwardRef<PadelPlayerHandle>(function PadelPlayer(_props, ref) {
    const root = useRef<Group>(null);
    const hips = useRef<Group>(null);
    const torso = useRef<Group>(null);
    const head = useRef<Group>(null);
    const hitShoulder = useRef<Group>(null);
    const hitElbow = useRef<Group>(null);
    const hitWrist = useRef<Group>(null);
    const freeShoulder = useRef<Group>(null);
    const freeElbow = useRef<Group>(null);
    const racket = useRef<Mesh>(null);
    const badge = useBadge();

    const frontLeg: LegRefs = {
        hip: useRef<Group>(null),
        knee: useRef<Group>(null),
        foot: useRef<Group>(null),
    };
    const backLeg: LegRefs = {
        hip: useRef<Group>(null),
        knee: useRef<Group>(null),
        foot: useRef<Group>(null),
    };

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
            hips.current.position.y = HIP_HEIGHT - pose.crouch * 0.24;

            torso.current.rotation.x = pose.lean;
            // Shoulders wind against the hips instead of riding them rigidly.
            torso.current.rotation.y = pose.twist;
            torso.current.rotation.z = pose.sideLean;

            if (head.current) {
                // The head leads the eyes and stays out of the shoulder twist,
                // so it keeps watching the ball rather than the body.
                head.current.rotation.x = pose.look;
                head.current.rotation.y = -pose.twist * 0.55;
            }

            if (hitShoulder.current) {
                // 0 -> arm down, 1 -> up and a touch behind the head.
                hitShoulder.current.rotation.x = -pose.swing * Math.PI * 1.08;
                // Nobody lifts an arm straight up the middle: the shoulder can
                // only take it overhead by swinging it out to the hitting side
                // first, so the raised arm sits about 30 degrees off vertical.
                hitShoulder.current.rotation.z = 0.2 + pose.swing * 0.36;
            }

            if (hitElbow.current) {
                // Negative folds the forearm forward. Kept near 0 at the top so
                // the arm reaches straight up and extends into the ball.
                hitElbow.current.rotation.x = -pose.elbow * 1.7;
            }

            if (hitWrist.current) {
                // Enough travel that a full snap turns the racket past
                // horizontal, which is what sends the head down through the
                // follow-through instead of leaving it pointing at the sky.
                hitWrist.current.rotation.x = -pose.wrist * 1.7;
                hitWrist.current.rotation.z = pose.wrist * 0.2;
            }

            if (freeShoulder.current) {
                freeShoulder.current.rotation.x = -pose.guard * 1.05;
                freeShoulder.current.rotation.z = -0.22 - pose.guard * 0.2;
            }

            if (freeElbow.current) {
                // The free arm folds as it comes up, and trails on the way down.
                freeElbow.current.rotation.x = -pose.guard * 0.85 - 0.12;
            }

            // Legs: the hip splits on the stride, the knee takes the crouch and
            // the ankle cancels both so the sole stays flat until the jump.
            const frontHip = -pose.stride - pose.crouch * 0.45;
            const frontKnee = pose.crouch * 0.95 + pose.stride * 0.35;
            const backHip = pose.stride * 0.8 + pose.crouch * 0.3;
            const backKnee = pose.crouch * 1.05;

            if (frontLeg.hip.current && frontLeg.knee.current && frontLeg.foot.current) {
                frontLeg.hip.current.rotation.x = frontHip;
                frontLeg.knee.current.rotation.x = frontKnee;
                frontLeg.foot.current.rotation.x =
                    -(frontHip + frontKnee) * 0.88 + pose.y * 1.1;
            }

            if (backLeg.hip.current && backLeg.knee.current && backLeg.foot.current) {
                backLeg.hip.current.rotation.x = backHip;
                backLeg.knee.current.rotation.x = backKnee;
                backLeg.foot.current.rotation.x =
                    -(backHip + backKnee) * 0.88 + pose.y * 1.4;
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

                <Leg x={0.11} refs={frontLeg} />
                <Leg x={-0.11} refs={backLeg} />

                <group ref={torso}>
                    <mesh
                        geometry={geometries.capsule}
                        material={shirt}
                        position={[0, 0.34, 0]}
                        scale={[0.46, 0.34, 0.36]}
                    />
                    {/* Vibaura on the chest. */}
                    <mesh
                        geometry={geometries.plane}
                        material={badge}
                        position={[0, 0.42, 0.183]}
                        scale={[0.13, 0.13, 1]}
                    />

                    <group ref={head} position={[0, 0.6, 0]}>
                        <mesh
                            geometry={geometries.cylinder}
                            material={skin}
                            position={[0, 0.02, 0]}
                            scale={[0.14, 0.1, 0.14]}
                        />
                        <mesh
                            geometry={geometries.sphere}
                            material={skin}
                            position={[0, 0.19, 0]}
                            scale={[0.34, 0.38, 0.34]}
                        />
                        {/* Hair as a slightly larger cap, pushed back off the face */}
                        <mesh
                            geometry={geometries.sphere}
                            material={hair}
                            position={[0, 0.23, -0.02]}
                            scale={[0.36, 0.34, 0.36]}
                        />
                    </group>

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
                            <group ref={hitWrist} position={[0, -0.34, 0]}>
                                {/* Hand gripping the handle. The knuckle line
                                    runs down the grip and the fingers wrap
                                    around it, which is how a handle is held;
                                    laying the fingers *along* the grip instead
                                    put the hand across the racket at an angle
                                    and made the two read as separate objects.
                                    Sitting square in the wrist frame like the
                                    racket does, the two cannot drift apart. */}
                                <group
                                    position={[0, -0.01, -0.0585]}
                                    rotation={[-Math.PI / 2, Math.PI / 2, 0]}
                                >
                                    {/* Rolled a half-turn around the grip so
                                        the palm faces down onto the handle,
                                        not up off it. */}
                                    <group rotation={[0, 0, Math.PI]}>
                                        <Hand material={skin} side={1} curl={0.62} />
                                    </group>
                                </group>
                                <mesh
                                    geometry={geometries.cylinder}
                                    material={grip}
                                    position={[0, -0.02, 0]}
                                    scale={[0.062, 0.3, 0.062]}
                                />
                                {/* Head in two pieces: a coloured frame with the
                                    face cut out of it, and a near-black
                                    perforated panel dropped into the gap. */}
                                <mesh
                                    geometry={padelFrame()}
                                    material={racketFrame}
                                    position={[0, -RACKET_DROP, 0]}
                                />
                                <mesh
                                    ref={racket}
                                    geometry={padelFace()}
                                    material={racketFace}
                                    position={[0, -RACKET_DROP, 0]}
                                />
                                {/* Throat collar, hiding the grip-to-frame join. */}
                                <mesh
                                    geometry={geometries.cylinder}
                                    material={racketFrame}
                                    position={[0, RACKET_NECK - RACKET_DROP, 0]}
                                    scale={[0.075, 0.05, 0.075]}
                                />
                            </group>
                        </group>
                    </group>

                    <group ref={freeShoulder} position={[-0.25, 0.52, 0]}>
                        <mesh
                            geometry={geometries.capsule}
                            material={skin}
                            position={[0, -0.17, 0]}
                            scale={[0.15, 0.2, 0.15]}
                        />
                        <group ref={freeElbow} position={[0, -0.32, 0]}>
                            <mesh
                                geometry={geometries.capsule}
                                material={skin}
                                position={[0, -0.14, 0]}
                                scale={[0.13, 0.19, 0.13]}
                            />
                            {/* Free hand, half closed the way a hand carried at
                                the ready is, not flat open. */}
                            <group position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                                <Hand material={skin} side={-1} curl={0.45} />
                            </group>
                        </group>
                    </group>
                </group>
            </group>
        </group>
    );
});

export default PadelPlayer;
