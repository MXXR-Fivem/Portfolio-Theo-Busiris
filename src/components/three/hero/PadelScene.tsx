"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Mesh } from "three";
import Stage from "@/components/three/Stage";
import Court from "@/components/three/hero/Court";
import PadelPlayer from "@/components/three/hero/PadelPlayer";
import type { PadelPlayerHandle, PadelPose } from "@/components/three/hero/PadelPlayer";
import { clamp, cycle, hash, lerp, noise, warp, weighted } from "@/components/three/anim";
import { geometries, padelBallTexture, toonMaterial } from "@/components/three/toon";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";

const PLAYER_Z = -2.2;

/** Baseline seconds for one rally: approach, smash, bounce, exit, brief rest. */
const PERIOD = 5;

/**
 * The player's body, keyed on the 0->1 rally clock. The racket stays low while
 * the lob drops, cocks up and back behind the head, then chops down; contact is
 * once it has come back past head height.
 *
 * The joints do not peak together. The legs load first, the hips fire, the
 * shoulders follow a beat later, then the elbow, then the wrist last of all,
 * and each keeps travelling past contact into a follow-through. That lag down
 * the chain is the whole difference between a person and a mechanism.
 */
const player = {
    lift: [
        [0, 0],
        [0.3, 0],
        [0.4, 0.14],
        [0.5, 0.46],
        [0.58, 0.4],
        [0.68, 0.04],
        [0.76, 0],
        [1, 0],
    ],
    // Loads deep before the drive, then a second, softer absorb on landing.
    crouch: [
        [0, 0.32],
        [0.16, 0.3],
        [0.32, 0.84],
        [0.42, 0.34],
        [0.5, 0.04],
        [0.6, 0.12],
        [0.7, 0.72],
        [0.84, 0.42],
        [1, 0.32],
    ],
    // The hips coil away first and unwind before the arm ever moves.
    turn: [
        [0, 0.14],
        [0.2, 0.3],
        [0.34, 0.44],
        [0.46, 0.1],
        [0.54, -0.22],
        [0.68, -0.06],
        [0.86, 0.1],
        [1, 0.14],
    ],
    // Shoulders against the hips: peaks a beat after them, crosses through zero
    // right at contact, and keeps rotating out onto the follow-through.
    twist: [
        [0, 0.02],
        [0.22, 0.16],
        [0.4, 0.32],
        [0.5, -0.06],
        [0.58, -0.3],
        [0.72, -0.1],
        [0.9, 0.02],
        [1, 0.02],
    ],
    lean: [
        [0, 0.16],
        [0.2, 0.1],
        [0.36, -0.2],
        [0.48, -0.1],
        [0.56, 0.24],
        [0.66, 0.34],
        [0.8, 0.2],
        [1, 0.16],
    ],
    sideLean: [
        [0, 0.02],
        [0.3, -0.08],
        [0.44, -0.2],
        [0.52, -0.04],
        [0.62, 0.14],
        [0.78, 0.06],
        [1, 0.02],
    ],
    // The arm takes about twice as long to go up as it does to come down: it is
    // lifted against gravity and then dropped with it, and a symmetric arc is
    // the single most mechanical thing a swing can do.
    swing: [
        [0, 0.06],
        [0.2, 0.04],
        [0.32, 0.18],
        [0.44, 0.94],
        [0.5, 1],
        [0.54, 0.78],
        [0.6, 0.3],
        [0.66, 0.06],
        [0.74, 0.03],
        [0.86, 0.07],
        [1, 0.06],
    ],
    // Folds on the way up, then extends hard into contact: that extension is
    // the whip. It stays loose afterwards, because elbow and wrist turn the
    // racket the same way the shoulder does, and re-folding them here would
    // carry the head back over the shoulder instead of down in front.
    elbow: [
        [0, 0.32],
        [0.22, 0.36],
        [0.36, 0.5],
        [0.46, 0.06],
        [0.5, 0.1],
        [0.56, 0.2],
        [0.62, 0.3],
        [0.7, 0.34],
        [0.84, 0.34],
        [1, 0.32],
    ],
    // Last link in the chain: cocked back at the top, released through contact,
    // then unwinding as the arm falls, so the head keeps swinging down and
    // across instead of standing up in front of the chest.
    //
    // The snap sits right on contact rather than trailing it: at 0.5 the
    // shoulder is still at the dead top of its own arc doing nothing, so the
    // wrist has to visibly break on its own in the next sliver of the timeline
    // or the ball reads as leaving the racket with no cause.
    wrist: [
        [0, 0.1],
        [0.3, 0.16],
        [0.44, -0.5],
        [0.5, -0.05],
        [0.52, 0.68],
        [0.6, 0.36],
        [0.68, 0.22],
        [0.76, 0.06],
        [0.88, 0.1],
        [1, 0.1],
    ],
    guard: [
        [0, 0.22],
        [0.24, 0.5],
        [0.4, 0.9],
        [0.5, 0.78],
        [0.6, 0.35],
        [0.72, 0.18],
        [1, 0.22],
    ],
    stride: [
        [0, 0.12],
        [0.24, 0.2],
        [0.4, 0.52],
        [0.5, 0.6],
        [0.6, 0.34],
        [0.72, 0.18],
        [1, 0.12],
    ],
    // Eyes on the ball: up the whole way in, down after it off the racket.
    look: [
        [0, 0.05],
        [0.2, -0.24],
        [0.44, -0.36],
        [0.52, -0.1],
        [0.62, 0.22],
        [0.74, 0.3],
        [0.9, 0.08],
        [1, 0.05],
    ],
    // 1 while the rally is happening, 0 either side of it. Idle motion is
    // faded out by this, so it never fights the swing.
    effort: [
        [0, 0],
        [0.18, 0],
        [0.32, 1],
        [0.68, 1],
        [0.86, 0],
        [1, 0],
    ],
} satisfies Record<string, [number, number][]>;

type Rally = {
    index: number;
    /** Wall-clock second the rally started on. */
    start: number;
    duration: number;
    /** Re-times the rally clock: positive winds up slowly and snaps through. */
    bias: number;
    /** Scales everything the legs and hips do, so shots differ in weight. */
    power: number;
    /** How high and how wide the ball leaves after the bounce. */
    exit: number;
    /** Where the lob comes in from, so it is not the same ball every time. */
    approach: number;
};

/**
 * No two rallies are the same length, the same weight, or timed the same way
 * inside themselves. A scene on a fixed period announces itself as a loop
 * within about fifteen seconds; this is what buys the extra minute.
 *
 * Keyed on the rally index rather than on a running random, so the ball meets
 * the racket identically on every machine and after every reload.
 */
function rallyAt(index: number, start: number): Rally {
    return {
        index,
        start,
        duration: PERIOD * lerp(0.84, 1.3, hash(index)),
        bias: lerp(-0.2, 0.3, hash(index + 91)),
        power: lerp(0.9, 1.12, hash(index + 17)),
        exit: lerp(-0.5, 0.7, hash(index + 43)),
        approach: lerp(-0.7, 0.7, hash(index + 129)),
    };
}

/**
 * `g` is the rally clock; `time` is the wall clock. Everything keyed on `g`
 * repeats exactly, so a second layer keyed on `time` rides on top: breathing,
 * a weight shift, a glance around. Their periods deliberately do not divide
 * the rally, so the loop never lands on the same frame twice.
 *
 * `power` scales the legs, the hips and the guard arm but never the swing
 * itself, because the swing is what the ball's contact point is measured from.
 */
function poseAt(g: number, time: number, power: number): PadelPose {
    // The Catmull-Rom overshoots a little either side of the effort track; the
    // clamp keeps the idle layer from briefly running backwards.
    const settle = 1 - clamp(cycle(g, player.effort), 0, 1);
    const breath = Math.sin(time * 1.9) * 0.014;
    const sway = Math.sin(time * 0.83) * 0.05 * settle;
    const shift = Math.sin(time * 0.61 + 1.2) * 0.035 * settle;
    // Nobody waits for the next ball standing still. Between rallies the player
    // works a split-step: a small hop that lands into a fresh crouch, plus a
    // wander on noise so the resets are not four copies of one reset.
    const hop = Math.max(0, Math.sin(time * 3.1)) ** 2 * 0.04 * settle;
    const wander = noise(time * 0.37) * 0.06 * settle;

    return {
        x: shift * 0.4 + Math.sin(time * 3.1 + 0.6) * 0.014 * settle,
        y: Math.max(0, cycle(g, player.lift) * power) + hop,
        z: PLAYER_Z + shift * 0.25,
        turn: weighted(g, player.turn, power) + sway + wander,
        twist: weighted(g, player.twist, power) - sway * 0.5,
        lean: cycle(g, player.lean) + breath + hop * 1.4,
        sideLean: cycle(g, player.sideLean) + Math.sin(time * 0.71) * 0.03 * settle,
        // The legs extend at the top of the hop and reload on the way down.
        crouch: weighted(g, player.crouch, power) + breath * 0.6 - hop * 2.4,
        swing: cycle(g, player.swing),
        elbow: cycle(g, player.elbow) + sway * 0.3,
        wrist: cycle(g, player.wrist) + Math.sin(time * 1.37) * 0.05 * settle,
        guard: weighted(g, player.guard, power) + Math.sin(time * 1.1) * 0.04 * settle,
        stride: weighted(g, player.stride, power),
        look: cycle(g, player.look) + Math.sin(time * 0.47) * 0.06 * settle + wander * 0.4,
    };
}

/**
 * The ball as a clean three-phase path rather than eased keyframes, so it never
 * trembles: a constant-speed lob in, a sharp acceleration the instant it is
 * struck, then an accelerating exit off the right of the page.
 */
const HIT = 0.5;
const BOUNCE = 0.64;
const GONE = 0.94;

// The lob start is relative to the measured contact; bounce and exit are fixed.
const APPROACH: [number, number, number] = [-0.35, 2.65, 4.6];
const BOUNCE_AT: [number, number, number] = [1.6, 0.13, 2.2];
const EXIT: [number, number, number] = [10, 3.8, 2.8];

function ballAt(g: number, contact: Vector3, rally: Rally, out: Vector3) {
    if (g < HIT) {
        // Constant-speed lob dropping onto the racket's contact point, coming
        // in from a slightly different line on every rally.
        const u = clamp((g - 0.08) / (HIT - 0.08), 0, 1);
        out.set(
            lerp(contact.x + APPROACH[0] + rally.approach, contact.x, u),
            lerp(contact.y + APPROACH[1], contact.y, u),
            lerp(contact.z + APPROACH[2] + rally.approach * 0.8, contact.z, u)
        );
        return;
    }

    if (g < BOUNCE) {
        // Struck: fast down and forward, gaining speed into the floor rather
        // than easing into it, so it reads as a smash slamming down and not
        // as the ball drifting gently onto the court.
        const u = (g - HIT) / (BOUNCE - HIT);
        out.set(
            lerp(contact.x, BOUNCE_AT[0] + rally.exit * 0.5, u),
            lerp(contact.y, BOUNCE_AT[1], u * u),
            lerp(contact.z, BOUNCE_AT[2] + rally.exit * 0.4, u)
        );
        return;
    }

    // Kicks off and accelerates off the right edge, higher or flatter by shot.
    const u = clamp((g - BOUNCE) / (GONE - BOUNCE), 0, 1);
    out.set(
        lerp(BOUNCE_AT[0] + rally.exit * 0.5, EXIT[0], u * u),
        lerp(BOUNCE_AT[1], EXIT[1] + rally.exit, Math.sqrt(u)),
        lerp(BOUNCE_AT[2] + rally.exit * 0.4, EXIT[2] + rally.exit * 1.4, u)
    );
}

function ballScale(g: number) {
    if (g < 0.08 || g > 0.98) {
        return 0;
    }

    // Grows a little on the way out to read as leaving the page.
    return 0.14 * (1 + Math.max(0, (g - BOUNCE) / (1 - BOUNCE)) * 0.9);
}

/**
 * Playback only: the hero runs on its own clock and answers to nothing on the
 * page. It is the first thing a reader sees, and a rally that stalls because
 * they have not scrolled yet reads as a broken canvas, not as an invitation.
 */
function PadelAction() {
    const playerRef = useRef<PadelPlayerHandle>(null);
    const ballRef = useRef<Mesh>(null);
    const ballPos = useMemo(() => new Vector3(), []);
    // The racket's world position at the moment of contact. Re-measured at the
    // top of every rally, because the shot's weight moves the contact point.
    const contact = useRef<Vector3 | null>(null);
    const rally = useRef<Rally>(rallyAt(0, 0));

    const ballMaterial = useMemo(() => {
        const material = toonMaterial("#9bb36e").clone();
        material.color.set("#ffffff");
        material.map = padelBallTexture();
        return material;
    }, []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // A backgrounded tab stops painting but not the clock, so on the way
        // back there can be minutes of rallies owed. Drop them and restart on
        // the current second rather than fast-forwarding through the backlog.
        if (time - rally.current.start > rally.current.duration * 8) {
            rally.current = rallyAt(rally.current.index, time);
            contact.current = null;
        }

        while (time - rally.current.start >= rally.current.duration) {
            rally.current = rallyAt(
                rally.current.index + 1,
                rally.current.start + rally.current.duration
            );
            contact.current = null;
        }

        const current = rally.current;

        if (!contact.current && playerRef.current) {
            // Pose the player at the hit and read where the racket actually is.
            // Read at time 0, where the idle layer is silent, so the contact
            // point depends on the shot and on nothing else.
            const point = new Vector3();
            playerRef.current.applyPose(poseAt(HIT, 0, current.power));
            playerRef.current.getRacketWorld(point);
            contact.current = point;
        }

        // The warp is what makes one rally hang on the wind-up and the next
        // one rush it, off the same eight keyframes.
        const g = clamp(warp((time - current.start) / current.duration, current.bias), 0, 1);

        playerRef.current?.applyPose(poseAt(g, time, current.power));

        if (ballRef.current && contact.current) {
            ballAt(g, contact.current, current, ballPos);
            ballRef.current.position.copy(ballPos);
            ballRef.current.scale.setScalar(ballScale(g));
        }
    });

    return (
        <group>
            <Court />
            <PadelPlayer ref={playerRef} />
            <mesh ref={ballRef} geometry={geometries.sphere} material={ballMaterial} />
        </group>
    );
}

export default function PadelScene({ capability }: { capability: DeviceCapability }) {
    return (
        <Stage
            camera={{ position: [-3.2, 2.3, 7], fov: 30 }}
            lookAt={[0.2, 1.55, -0.8]}
            capability={capability}
            animated
            fog={[10, 18]}
            shadow={false}
        >
            <PadelAction />
        </Stage>
    );
}
