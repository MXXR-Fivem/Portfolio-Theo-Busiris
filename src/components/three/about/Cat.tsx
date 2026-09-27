"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import type { Group } from "three";
import { catCrownTexture, geometries, stripeTexture, toonMaterial } from "@/components/three/toon";
import { clamp, hash, lerp, smoothstep } from "@/components/three/anim";

export type CatPose = {
    x: number;
    z: number;
    /**
     * Strides travelled, in whole cycles. Fractional part drives the gait, and
     * it only ever counts up: a gait played backwards is unmistakable, so the
     * scene integrates ground covered rather than reading off the crossing.
     */
    stride: number;
    /**
     * 1 running, 0 standing. Scroll can stop mid-stride, and a cat frozen with
     * a paw in the air is the one thing that would give the rig away, so the
     * gait fades out into a stand instead of holding whatever frame it was on.
     */
    run: number;
    /** Wall clock, for everything that has to keep breathing while stopped. */
    time: number;
};

export type CatHandle = {
    applyPose: (pose: CatPose) => void;
};

/**
 * Two cats running the same gait function at the same settings will always look
 * like one cat drawn twice, however far apart their phases are. These are the
 * numbers that have to differ for them to read as two animals.
 */
export type CatGait = {
    /** Fraction of a stride a given paw spends planted on the ground. */
    duty: number;
    /** How far a hip swings either side of vertical, in radians. */
    reach: number;
    /** Stride phase per paw: front-near, front-far, hind-near, hind-far. */
    lead: [number, number, number, number];
    /** How far the body rises on the drive off the hind legs. */
    bounce: number;
};

type CatProps = {
    coat: string;
    belly: string;
    gait: CatGait;
    /**
     * Shifts every rhythm that is not the gait itself: the roll, the glance,
     * the tail. Two cats on the same seed breathe together, which is the tell.
     */
    seed?: number;
    /** Small differences keep the pair from reading as a copy-paste. */
    scale?: number;
    /** Tail colour, when it differs from the coat (the white cat's grey tail). */
    tail?: string;
    /** A short tail is a single segment instead of a curved two-piece one. */
    shortTail?: boolean;
    /** Lighter banding painted over the back, for the tabby. */
    stripes?: string;
    /** A small patch on top of the head, between the ears. */
    crownPatch?: string;
};

/**
 * Where a stopped cat is looking, as yaw, pitch and head tilt in -1 -> 1.
 *
 * A cat at rest does not sweep its head around. It snaps to a direction, holds
 * it while it decides the place is boring, then snaps somewhere else. Driving
 * this off smooth noise, which is what it used to do, produces a slow continuous
 * drift: the head is always moving and never actually looking at anything.
 *
 * The beat length is seeded, so two cats stopping side by side are never on the
 * same schedule and rarely pick the same direction.
 */
function glance(time: number, seed: number) {
    const beat = time * (0.74 + seed * 0.32) + seed * 11.7;
    const index = Math.floor(beat);
    // Held for three quarters of the beat, then a quick turn into the next one.
    const turn = smoothstep(0.76, 1, beat - index);

    function pick(step: number, channel: number) {
        return (hash(step * 3.7 + channel * 19.3 + seed * 53.1) - 0.5) * 2;
    }

    return {
        yaw: lerp(pick(index, 0), pick(index + 1, 0), turn),
        pitch: lerp(pick(index, 1), pick(index + 1, 1), turn),
        tilt: lerp(pick(index, 2), pick(index + 1, 2), turn),
    };
}

/** Standing height of the body group; the run bob is added on top of it. */
const BODY_HEIGHT = 0.54;
/** Where the four legs hang from, measured off the floor. */
const LEG_ROOT = 0.46;
/** Front pair then hind pair, near side of the camera first. */
const LEG_POSITIONS: [number, number][] = [
    [0.24, 0.12],
    [0.24, -0.12],
    [-0.24, 0.12],
    [-0.24, -0.12],
];
const TAU = Math.PI * 2;

/**
 * Where one leg is within its own stride, as three signed joint rotations.
 *
 * Planted legs sweep back at a strictly constant rate, because that rate is the
 * ground going past: ease it and the paw skates. The airborne half folds up and
 * whips forward roughly twice as fast, which is the asymmetry a plain sine wave
 * cannot express.
 *
 * The ankle is what makes a leg read as a leg rather than as two sticks. Under
 * load it cancels the two joints above it, so the paw stays flat and dead still
 * on the floor while the body travels over it; in the air it lets the paw hang
 * back off the lift, tucks it up under the body, and sets it down level again.
 */
function limb(
    stride: number,
    duty: number,
    reach: number,
    kneeSign: number,
    swingFold: number
) {
    const t = stride - Math.floor(stride);

    if (t < duty) {
        const u = t / duty;
        const hip = reach - u * 2 * reach;
        // Compresses under the weight at mid-stance, extends into the push off.
        const knee = (0.17 + Math.sin(u * Math.PI) * 0.15) * kneeSign;

        return { hip, knee, ankle: -(hip + knee), lift: 0 };
    }

    // The slope the airborne half has to leave and arrive on so the paw never
    // changes direction with a snap. Matching it is what buys the small
    // backward overshoot at lift-off and the reach-then-settle before touchdown.
    const handoff = (-2 * reach * (1 - duty)) / duty;
    const u = (t - duty) / (1 - duty);
    const u2 = u * u;
    const u3 = u2 * u;

    const hip =
        (2 * u3 - 3 * u2 + 1) * -reach +
        (u3 - 2 * u2 + u) * handoff +
        (-2 * u3 + 3 * u2) * reach +
        (u3 - u2) * handoff;
    const knee = (0.17 + Math.sin(u * Math.PI) ** 0.7 * swingFold) * kneeSign;

    return {
        hip,
        knee,
        // Level by touchdown, loose on the way there: the squared term hands
        // the paw back to the floor late, and the tuck keeps the toes clear.
        ankle: -(hip + knee) * (0.3 + 0.7 * u2) + Math.sin(u * Math.PI) * 0.2 * kneeSign,
        lift: Math.sin(u * Math.PI) * 0.05,
    };
}

/** Front knees fold back, hind knees fold the other way, as a cat's do. */
const KNEE_SIGN = [-1, -1, 1, 1];
/**
 * Where the legs settle once the run dies out: the front pair close to vertical,
 * the hind pair folded into the crouch a cat stands in. Four identical angles
 * would read as a table, so each paw lands slightly off its neighbour, the way
 * an animal that has just stopped never squares itself up.
 */
const STAND_HIP = [0.1, 0.04, -0.3, -0.36];
const STAND_FOLD = [0.2, 0.24, 0.58, 0.64];
/** The hind pair drives; the front pair mostly catches the landing, so it never
 *  sweeps as far. Four legs on one amplitude is what reads as a toy. */
const REACH_BY_LEG = [0.9, 0.9, 1.12, 1.12];
/**
 * How far the mid-swing joint folds, per leg. The hock closes hard to carry the
 * hind paw clear of the floor; the front elbow barely does, because the front
 * leg reaches forward rather than tucking under. Fold both the same amount and
 * the swinging leg snaps into a Z instead of swinging through.
 */
const SWING_FOLD = [0.46, 0.46, 0.64, 0.64];

/**
 * Front and hind are not the same limb, and building both from one set of
 * numbers is most of why four capsules read as furniture. The front leg is a
 * near-straight column that catches the landing: even segments, slim, barely
 * bent. The hind is the zig-zag that does the pushing: a heavy thigh, a short
 * shank, and a long foot below the hock the front leg has no equivalent of.
 *
 * Both add up to the same drop, so the cat still stands level.
 */
const LEG_SHAPE = [
    { thigh: 0.155, shank: 0.16, foot: 0.11, top: 0.115, mid: 0.098, low: 0.081 },
    { thigh: 0.155, shank: 0.16, foot: 0.11, top: 0.115, mid: 0.098, low: 0.081 },
    { thigh: 0.185, shank: 0.135, foot: 0.105, top: 0.151, mid: 0.11, low: 0.085 },
    { thigh: 0.185, shank: 0.135, foot: 0.105, top: 0.151, mid: 0.11, low: 0.085 },
];

/**
 * Every segment is drawn longer than the bone it stands for, so that it starts
 * above its own joint and the parent's end is buried inside it. Two capsules
 * that meet exactly on a joint leave a notch on the outside of every bend, and
 * a leg full of notches reads as a string of beads rather than as a limb.
 */
function bone(length: number, width: number, direction: -1 | 1 = -1) {
    const overlap = width * 0.65;

    return {
        position: [0, (direction * (length - overlap)) / 2, 0] as [number, number, number],
        scale: [width, (overlap + length) / 2, width] as [number, number, number],
    };
}

/**
 * The tail as a chain of short links rather than two hinged pieces. Two pieces
 * meeting at one angle is exactly what reads as a bent stick, and no amount of
 * animation hides the hinge. Five links, each turning a little further than the
 * last and lagging a little further behind the body, read as one tail. A short
 * tail is the same chain cut off early.
 */
const TAIL_LINKS = 5;
const SHORT_TAIL_LINKS = 3;
const TAIL_LENGTH = 0.125;
/**
 * Base bend per link. It leaves the rump almost horizontal and turns hard on
 * every link after that, so the tail ends up pointing at the sky: a tail that
 * only bends a few degrees per joint is a straight tail however many joints it
 * has, and a straight tail is a stick.
 */
const TAIL_CURL = [1.3, -0.22, -0.28, -0.32, -0.36];
const TAIL_WIDTH = [0.062, 0.056, 0.05, 0.044, 0.038];

const nose = toonMaterial("#b98a7f");
/** Both cats have the same green eyes, so one pair of materials covers them. */
const iris = toonMaterial("#a9c25e");
const pupil = toonMaterial("#23261f");

/** A stylised cat, sized in the same units as the rest of the scenes. */
const Cat = forwardRef<CatHandle, CatProps>(function Cat(
    { coat, belly, gait, seed = 0, scale = 1, tail, shortTail = false, stripes, crownPatch },
    ref
) {
    const root = useRef<Group>(null);
    const body = useRef<Group>(null);
    const spine = useRef<Group>(null);
    const head = useRef<Group>(null);
    const tailChain = [
        useRef<Group>(null),
        useRef<Group>(null),
        useRef<Group>(null),
        useRef<Group>(null),
        useRef<Group>(null),
    ];
    const legs = [
        useRef<Group>(null),
        useRef<Group>(null),
        useRef<Group>(null),
        useRef<Group>(null),
    ];
    const knees = [
        useRef<Group>(null),
        useRef<Group>(null),
        useRef<Group>(null),
        useRef<Group>(null),
    ];
    const ankles = [
        useRef<Group>(null),
        useRef<Group>(null),
        useRef<Group>(null),
        useRef<Group>(null),
    ];

    const coatMaterial = useMemo(() => toonMaterial(coat), [coat]);
    const bellyMaterial = useMemo(() => toonMaterial(belly), [belly]);
    const tailMaterial = useMemo(() => toonMaterial(tail ?? coat), [tail, coat]);

    // The crown patch is painted into the head texture, so it has no thickness.
    const headMaterial = useMemo(() => {
        if (!crownPatch) {
            return coatMaterial;
        }

        const material = toonMaterial(coat).clone();
        material.color.set("#ffffff");
        material.map = catCrownTexture(coat, crownPatch);
        return material;
    }, [crownPatch, coat, coatMaterial]);

    // The tabby's flank stripes are painted into the coat via a texture, so they
    // stay flush instead of standing out as raised bands.
    const bodyMaterial = useMemo(() => {
        if (!stripes) {
            return coatMaterial;
        }

        const material = toonMaterial(coat).clone();
        material.color.set("#ffffff");
        material.map = stripeTexture(coat, stripes);

        return material;
    }, [stripes, coat, coatMaterial]);

    useImperativeHandle(ref, () => ({
        applyPose(pose: CatPose) {
            if (!root.current || !body.current) {
                return;
            }

            root.current.position.x = pose.x;
            root.current.position.z = pose.z;

            const run = clamp(pose.run, 0, 1);
            const idle = 1 - run;
            const drift = seed * TAU;
            // Everything the standing cat does hangs off this: slower than any
            // rhythm in the gait, and offset per cat so the two never settle
            // into the same pose at the same moment.
            const rest = pose.time * (0.62 + seed * 0.2) + drift;

            for (let index = 0; index < 4; index += 1) {
                const leg = legs[index].current;
                const knee = knees[index].current;
                const ankle = ankles[index].current;

                if (!leg || !knee || !ankle) {
                    continue;
                }

                const sign = KNEE_SIGN[index];
                const moving = limb(
                    pose.stride + gait.lead[index],
                    gait.duty,
                    gait.reach * REACH_BY_LEG[index],
                    sign,
                    SWING_FOLD[index]
                );

                const standHip = STAND_HIP[index];
                const standKnee = STAND_FOLD[index] * sign;

                leg.rotation.z = lerp(standHip, moving.hip, run);
                leg.position.y = LEG_ROOT + moving.lift * run;
                knee.rotation.z = lerp(standKnee, moving.knee, run);
                // Standing, the paw is simply flat: the same cancellation the
                // planted half of the stride uses, with nothing on top of it.
                ankle.rotation.z = lerp(-(standHip + standKnee), moving.ankle, run);
            }

            // The body rises once per stride, on the drive off the hind legs;
            // stopped, the same group carries the breathing instead.
            const beat = pose.stride * TAU;
            const breath = Math.sin(rest * 2.1) * 0.009;
            body.current.position.y =
                BODY_HEIGHT +
                (Math.sin(beat + 1.1) + 1) * gait.bounce * run +
                breath * idle;
            // A slow roll on a period that does not divide the stride, so the
            // run never settles into a perfect metronome.
            body.current.rotation.x =
                Math.sin(beat * (0.37 + seed * 0.14) + 0.4 + drift) * 0.03 * run +
                Math.sin(rest * 0.83) * 0.02 * idle;

            // The back arches and extends with the drive, a beat behind the bob.
            const arch = Math.sin(beat + 2) * 0.045 * run + breath * 0.8 * idle;

            if (spine.current) {
                spine.current.rotation.z = arch;
            }

            if (head.current) {
                // Cats hold their head almost still while the body works under
                // it: cancel most of the arch, then let it look around. Running,
                // that is a small sway; stopped, it is a proper glance, held and
                // then snapped somewhere else, with a tilt to go with it.
                const look = glance(pose.time, seed);

                head.current.rotation.z =
                    -arch * 0.85 +
                    Math.sin(beat + 0.4) * 0.02 * run +
                    look.tilt * 0.14 * idle;
                head.current.rotation.y = lerp(
                    look.yaw * 0.62,
                    Math.sin(beat * (0.29 + seed * 0.11) + drift) * 0.18,
                    run
                );
                head.current.rotation.x = look.pitch * 0.22 * idle;
            }

            // The tail is dragged along rather than driven: every link reads
            // the body's motion from further back in time than the one before
            // it, and swings a little wider, so the wave travels out to the tip
            // instead of the whole tail turning at once. Standing, it stops
            // being dragged and starts being swung.
            for (let index = 0; index < TAIL_LINKS; index += 1) {
                const link = tailChain[index].current;

                if (!link) {
                    continue;
                }

                const lag = (pose.stride - 0.14 * (index + 1)) * TAU;
                const idle = rest * 1.05 - index * 0.55;
                const gain = 0.03 + index * 0.026;

                link.rotation.z =
                    TAIL_CURL[index] +
                    lerp(Math.sin(idle) * gain, Math.sin(lag) * gain * 1.5, run);
                link.rotation.y = lerp(
                    Math.sin(idle * 0.72 + drift) * gain * 2,
                    Math.sin(lag * 0.41 + drift) * gain * 1.7,
                    run
                );
            }
        },
    }));

    const links = shortTail ? SHORT_TAIL_LINKS : TAIL_LINKS;

    function tailLink(index: number) {
        if (index >= links) {
            return null;
        }

        return (
            <group
                key={`tail-${index}`}
                ref={tailChain[index]}
                position={index === 0 ? [-0.33, 0.04, 0] : [0, TAIL_LENGTH, 0]}
            >
                <mesh
                    geometry={geometries.capsule}
                    material={tailMaterial}
                    {...bone(TAIL_LENGTH, TAIL_WIDTH[index], 1)}
                />
                {tailLink(index + 1)}
            </group>
        );
    }

    return (
        <group ref={root} scale={scale}>
            <group ref={body} position={[0, BODY_HEIGHT, 0]}>
                <group ref={spine}>
                    <mesh
                        geometry={geometries.capsule}
                        material={bodyMaterial}
                        rotation={[0, 0, Math.PI / 2]}
                        scale={[0.32, 0.34, 0.32]}
                    />
                    <mesh
                        geometry={geometries.capsule}
                        material={bellyMaterial}
                        position={[0, -0.07, 0]}
                        rotation={[0, 0, Math.PI / 2]}
                        scale={[0.22, 0.28, 0.26]}
                    />
                    {/* Shoulder and hindquarter. Without these the legs hang
                        off a tube: a cat's mass is at the two ends, and the
                        haunch is the single most recognisable part of it. */}
                    <mesh
                        geometry={geometries.sphere}
                        material={bodyMaterial}
                        position={[0.21, -0.05, 0]}
                        scale={[0.31, 0.28, 0.35]}
                    />
                    <mesh
                        geometry={geometries.sphere}
                        material={bodyMaterial}
                        position={[-0.23, -0.05, 0]}
                        scale={[0.37, 0.35, 0.38]}
                    />

                    {/* Bib under the neck, toward the head end. */}
                    <mesh
                        geometry={geometries.sphere}
                        material={bellyMaterial}
                        position={[0.28, -0.02, 0]}
                        scale={[0.18, 0.16, 0.2]}
                    />

                    {/* Head; the crown patch is baked into headMaterial, no geometry. */}
                    <group ref={head} position={[0.4, 0.2, 0]}>
                        <mesh
                            geometry={geometries.sphere}
                            material={headMaterial}
                            scale={[0.34, 0.33, 0.33]}
                        />
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
                            <group key={`eye-${side}`} position={[0.12, 0.05, side * 0.1]}>
                                <mesh
                                    geometry={geometries.sphere}
                                    material={iris}
                                    scale={[0.056, 0.066, 0.056]}
                                />
                                {/* A slit pupil sunk into the iris, so the green
                                    reads as an eye and not as a bead. */}
                                <mesh
                                    geometry={geometries.sphere}
                                    material={pupil}
                                    position={[0.017, 0, 0]}
                                    scale={[0.03, 0.05, 0.026]}
                                />
                            </group>
                        ))}
                    </group>

                    {/* Tail: a chain rooted at the rump, each link hanging
                        off the end of the one above it. */}
                    {tailLink(0)}
                </group>
            </group>

            {LEG_POSITIONS.map(([x, z], index) => {
                const shape = LEG_SHAPE[index];

                return (
                    <group key={`leg-${index}`} ref={legs[index]} position={[x, LEG_ROOT, z]}>
                        <mesh
                            geometry={geometries.capsule}
                            material={coatMaterial}
                            {...bone(shape.thigh, shape.top)}
                        />
                        <group ref={knees[index]} position={[0, -shape.thigh, 0]}>
                            <mesh
                                geometry={geometries.capsule}
                                material={coatMaterial}
                                {...bone(shape.shank, shape.mid)}
                            />
                            <group ref={ankles[index]} position={[0, -shape.shank, 0]}>
                                <mesh
                                    geometry={geometries.capsule}
                                    material={coatMaterial}
                                    {...bone(shape.foot, shape.low)}
                                />
                                {/* The paw: wider than the leg above it and
                                    longer along the run than across it, set
                                    forward off the ankle. A cat lands on a pad,
                                    and a pad the width of the shin is invisible. */}
                                <mesh
                                    geometry={geometries.sphere}
                                    material={coatMaterial}
                                    position={[0.02, -shape.foot - 0.008, 0]}
                                    scale={[0.135, 0.058, 0.1]}
                                />
                            </group>
                        </group>
                    </group>
                );
            })}
        </group>
    );
});

export default Cat;
