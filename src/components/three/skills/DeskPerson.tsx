"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { Group } from "three";
import Hand from "@/components/three/Hand";
import { CLAY, INK, geometries, toonMaterial } from "@/components/three/toon";
import { clamp, lerp, noise } from "@/components/three/anim";

export type DeskPose = {
    /** Typing cycle in radians. Integrated by the scene, never `time * rate`,
     *  because the rate itself changes and a rate change on a raw clock jumps. */
    phase: number;
    /** Small idle sway of the upper body. */
    sway: number;
    /** 0 hands resting, 1 typing flat out. Drives the lean, not just the hands. */
    effort: number;
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
                {/* Curled onto the keys, not laid flat on them. */}
                <Hand material={skin} side={side} curl={0.35} />
            </group>
        </group>
    );
}

/** Seen from above: head, shoulders and the hands doing the work. */
const DeskPerson = forwardRef<DeskPersonHandle>(function DeskPerson(_props, ref) {
    const torso = useRef<Group>(null);
    const head = useRef<Group>(null);
    const leftHand = useRef<Group>(null);
    const rightHand = useRef<Group>(null);

    useImperativeHandle(ref, () => ({
        applyPose(pose: DeskPose) {
            const effort = clamp(pose.effort, 0, 1);

            if (torso.current) {
                torso.current.rotation.z = Math.sin(pose.sway) * 0.02;
                // Leans into a burst and sits back out of it. Seen from above
                // that is most of what makes a pause read as a pause.
                torso.current.rotation.x = lerp(-0.04, 0.05, effort);
                torso.current.position.y =
                    SEAT_Y + Math.sin(pose.sway * 1.3) * 0.006 - effort * 0.01;
            }

            if (head.current) {
                // Between bursts the head drifts off the screen and back, which
                // is what thinking looks like from this camera.
                head.current.rotation.y = noise(pose.sway * 0.6) * 0.3 * (1 - effort * 0.75);
                head.current.rotation.x = lerp(0.1, -0.02, effort);
            }

            // Hands alternate with a short travel, so it reads as typing rather
            // than drumming, and the offset keeps the two out of phase. The
            // travel collapses as the burst dies, so resting hands sit still.
            const travel = 0.012 + effort * 0.024;

            if (leftHand.current) {
                leftHand.current.position.y = 0.1 + Math.max(0, Math.sin(pose.phase)) * travel;
            }

            if (rightHand.current) {
                rightHand.current.position.y =
                    0.1 + Math.max(0, Math.sin(pose.phase * 1.15 + 1.9)) * travel;
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
                {/* Neck and head on their own pivot, so the head can turn
                    away from the screen without the shoulders following it. */}
                <group ref={head} position={[0, 0.36, -0.02]}>
                    <mesh
                        geometry={geometries.cylinder}
                        material={skin}
                        scale={[0.13, 0.1, 0.13]}
                    />
                    <mesh
                        geometry={geometries.sphere}
                        material={skin}
                        position={[0, 0.14, -0.02]}
                        scale={[0.36, 0.4, 0.36]}
                    />
                    {/* The camera sits behind and above, so the hair is nearly
                        all of what it sees of the head, and three numbers have
                        to hold at once. Its top must clear the skull's top, or
                        a bald patch opens at the crown, which is the first
                        thing this angle shows. Its front edge must stop short
                        of the skull's, or there is no forehead at all. Its back
                        edge must overhang, or the head reads as facing away.
                        Against a skull of radius (0.18, 0.20, 0.18) centred at
                        y 0.14, z -0.02, these clear the crown by 0.012, leave a
                        0.017 strip of forehead, and overhang the nape by 0.047.
                        Move any of them without re-checking the other two and
                        one of the three breaks. */}
                    <mesh
                        geometry={geometries.sphere}
                        material={hair}
                        position={[0, 0.156, 0.012]}
                        scale={[0.394, 0.39, 0.39]}
                    />
                    {/* Nape: longest down the centre line, tapering out to the
                        sides. That taper is what says which way the head is on. */}
                    <mesh
                        geometry={geometries.sphere}
                        material={hair}
                        position={[0, 0.075, 0.13]}
                        scale={[0.24, 0.26, 0.2]}
                    />
                </group>
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
