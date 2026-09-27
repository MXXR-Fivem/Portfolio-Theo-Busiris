"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Stage from "@/components/three/Stage";
import Cat from "@/components/three/about/Cat";
import type { CatGait, CatHandle } from "@/components/three/about/Cat";
import { clamp, damp, hash, lerp, noise, smoothstep } from "@/components/three/anim";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";

/**
 * Strides per world unit travelled. Keying the gait to distance rather than to
 * time is what keeps the paws from skating; the smaller cat covers the same
 * ground in more, shorter strides. The absolute value matters as much as the
 * ratio: at this size and speed a cat turns over about two strides a second,
 * and anything much slower reads as gliding rather than running.
 */
const WHITE_STRIDE = 1.18;
const GREY_STRIDE = 1.42;
const TAU = Math.PI * 2;

/**
 * Crossings per second, flat out. The gait is keyed to distance travelled, so
 * ground speed *is* stride rate, and this number is really a stride rate in
 * disguise: at this band's width it works out around three strides a second,
 * which is a cat at a brisk trot. Push it and the legs turn over faster than
 * any cat can move them, and four legs at a blur read as one blur.
 */
const MAX_PACE = 0.11;
/** How hard they close the remaining distance, before the cap bites. */
const CLOSING = 2.2;
/**
 * Past 1 the pair is already off the right of the band. Aiming out there is
 * what keeps them at full speed as they leave: aim at the edge itself and the
 * easing above would have them tiptoeing over it.
 */
const EXIT = 1.18;

/**
 * Two gaits, and neither of them pairs the legs up.
 *
 * The white trots: diagonal couplets, front-left with hind-right, so the two
 * legs on the camera's side are always half a stride apart and visibly
 * scissoring past each other. The hind of each couplet lands a hair before the
 * front, which is what keeps it from reading as a wind-up toy.
 *
 * The tabby runs a four-beat lateral sequence instead: hind, front, hind,
 * front, evenly spaced a quarter of a stride apart, so no two of its paws ever
 * touch down together. Nothing about the two patterns lines up, which is the
 * only reason two identical rigs read as two different animals.
 *
 * `lead` is front-near, front-far, hind-near, hind-far.
 */
const WHITE_GAIT: CatGait = {
    duty: 0.48,
    reach: 0.42,
    lead: [0, 0.5, 0.52, 0.02],
    bounce: 0.016,
};
const GREY_GAIT: CatGait = {
    duty: 0.5,
    reach: 0.44,
    lead: [0.26, 0.76, 0, 0.5],
    bounce: 0.024,
};

type Phase = "toStall" | "waiting" | "crossing" | "resting";

type Pass = {
    index: number;
    /** 0 for a straight sprint, otherwise seconds spent pulled up mid-band. */
    stall: number;
    /** How far into the crossing they pull up. */
    stallAt: number;
    /** Seconds waiting off-screen before coming back the next time. */
    rest: number;
    phase: Phase;
    /** Wall-clock second the current wait ends on. */
    until: number;
};

/**
 * Every crossing is a different crossing. Some are a straight sprint; on the
 * others the pair pulls up in the middle, has a look around and then bolts. The
 * pause off-screen afterwards varies too, so they do not reappear on a beat.
 *
 * Keyed on the pass index rather than on a running random, so the band behaves
 * the same on every machine.
 */
function passAt(index: number): Pass {
    const stalls = hash(index + 23) > 0.72;

    return {
        index,
        stall: stalls ? lerp(0.4, 0.8, hash(index + 31)) : 0,
        stallAt: lerp(0.32, 0.58, hash(index + 71)),
        rest: lerp(0.15, 0.6, hash(index + 57)),
        phase: stalls ? "toStall" : "crossing",
        until: 0,
    };
}

/**
 * Both cats run the whole way; the grey chases the white and closes the gap.
 *
 * The crossing is not read off the clock. A destination is set, and the pair
 * runs to it at a capped pace: that cap is what lets the timeline vary without
 * the legs ever turning over faster than a cat's can. Slowing to a stop and
 * standing around then costs nothing extra, because how fast they are actually
 * travelling is also what decides whether they are running at all.
 */
function Walk() {
    const leader = useRef<CatHandle>(null);
    const follower = useRef<CatHandle>(null);
    const viewport = useThree((state) => state.viewport);
    const pass = useRef<Pass>(passAt(0));
    const chase = useRef({ at: 0, pace: 0 });
    const run = useRef(0);
    // Strides are integrated from ground covered rather than read off the
    // crossing, so the jump back to the left edge between passes cannot land
    // the legs on a different phase than the one they left on.
    const strides = useRef({ white: 0, grey: 0, whiteX: 0, greyX: 0, started: false });

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;
        const current = pass.current;
        const moving = chase.current;
        const target =
            current.phase === "toStall"
                ? current.stallAt
                : // Waiting holds wherever they actually pulled up, so the pace
                  // damps to nothing instead of creeping at the last hundredth.
                  current.phase === "waiting"
                  ? moving.at
                  : EXIT;

        const step = delta > 0.05 ? 0.05 : delta;
        const wanted = clamp((target - moving.at) * CLOSING, -MAX_PACE, MAX_PACE);
        // Damped rather than assigned, and slowly: a cat leans into a run over
        // the best part of a second, and starting at full speed on frame one is
        // exactly what made the entry read as a jump cut.
        moving.pace = damp(moving.pace, wanted, 0.02, step);
        moving.at = clamp(moving.at + moving.pace * step, 0, EXIT);

        // Fast to break into a run, slower to come out of one.
        const pace = clamp(Math.abs(moving.pace) / MAX_PACE, 0, 1);
        run.current = damp(run.current, pace, pace > run.current ? 0.0002 : 0.02, delta);

        if (current.phase === "toStall") {
            if (moving.at >= current.stallAt - 0.03) {
                current.phase = "waiting";
                current.until = time + current.stall;
            }
        } else if (current.phase === "waiting") {
            if (time >= current.until) {
                current.phase = "crossing";
            }
        } else if (current.phase === "crossing") {
            if (moving.at >= 1) {
                current.phase = "resting";
                current.until = time + current.rest;
            }
        } else if (time >= current.until) {
            // Both ends of the band are off-screen, so restarting the crossing
            // here is invisible; anywhere else it would be a cut.
            pass.current = passAt(current.index + 1);
            moving.at = 0;
            moving.pace = 0;
            run.current = 0;
            strides.current.started = false;
        }

        const d = moving.at;
        // How far off-screen each end of the run starts, in world units. Kept
        // just past a body's length rather than a wide margin, so less of the
        // run-up is spent hidden before the pair is actually on screen.
        const OFFSCREEN = 1.1;
        const span = viewport.width + OFFSCREEN * 2;
        const edge = viewport.width / 2 + OFFSCREEN;

        // The leader is not on rails either: it surges and eases across the run
        // on a ripple small enough to stay strictly forward-moving. Its legs
        // pick the change up for free, because the gait is keyed to distance.
        const whiteX = -edge + (d + Math.sin(d * TAU * 3) * 0.013) * span;

        // The white leaves first (big gap, so the grey is not hidden behind it),
        // then the grey closes in as the chase goes on. The surge on top means
        // it gains ground in bursts rather than at one machined rate.
        const gap =
            lerp(2.4, 0.85, smoothstep(0.05, 0.7, d)) + Math.sin(d * TAU * 2.2) * 0.13;
        const greyX = whiteX - gap;
        const tracked = strides.current;

        if (tracked.started) {
            tracked.white += Math.abs(whiteX - tracked.whiteX) * WHITE_STRIDE;
            tracked.grey += Math.abs(greyX - tracked.greyX) * GREY_STRIDE;
        }

        tracked.whiteX = whiteX;
        tracked.greyX = greyX;
        tracked.started = true;

        leader.current?.applyPose({
            x: whiteX,
            // A weave rather than a rail, with a noise drift on top so the line
            // it runs is never the same line twice across the band.
            z: 0.1 + Math.sin(d * TAU * 1.4) * 0.07 + noise(d * 6.1 + current.index) * 0.04,
            stride: tracked.white,
            run: run.current,
            time,
        });

        follower.current?.applyPose({
            x: greyX,
            z:
                -0.45 +
                Math.sin(d * TAU * 1.9 + 2.1) * 0.05 +
                noise(d * 5.3 + current.index + 9) * 0.04,
            stride: tracked.grey + 0.25,
            // The smaller cat is quicker off the mark and quicker to give up.
            run: clamp(run.current * 1.15, 0, 1),
            time,
        });
    });

    return (
        <group>
            {/* White with a near-black tail and a grey cap over the crown. */}
            <Cat
                ref={leader}
                coat="#f7f6f2"
                belly="#ffffff"
                tail="#41434a"
                crownPatch="#565a62"
                gait={WHITE_GAIT}
            />
            {/* Silver tabby: mid grey with darker banding over a warm cream
                chest and belly, and a short single tail. */}
            <Cat
                ref={follower}
                coat="#75746d"
                belly="#a49d90"
                stripes="#4e4d48"
                shortTail
                scale={0.88}
                gait={GREY_GAIT}
                seed={0.43}
            />
        </group>
    );
}

export default function CatsScene({ capability }: { capability: DeviceCapability }) {
    return (
        <Stage
            camera={{ position: [0, 0.72, 4.6], fov: 22 }}
            lookAt={[0, 0.45, 0]}
            capability={capability}
            animated
            fog={[4, 8.5]}
            shadow={{ position: [0, 0, 0], scale: 4, opacity: 0.2, blur: 3 }}
            forceContactShadow
        >
            <Walk />
        </Stage>
    );
}
