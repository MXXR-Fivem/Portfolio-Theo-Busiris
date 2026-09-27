export function clamp(value: number, min: number, max: number) {
    return value < min ? min : value > max ? max : value;
}

export function lerp(from: number, to: number, amount: number) {
    return from + (to - from) * amount;
}

/** 0 before `edge0`, 1 after `edge1`, eased in between. */
export function smoothstep(edge0: number, edge1: number, value: number) {
    const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);

    return t * t * (3 - 2 * t);
}

/** Maps a sub-range of a timeline back to 0 -> 1. */
export function range(start: number, end: number, value: number) {
    return clamp((value - start) / (end - start), 0, 1);
}

/**
 * Reads a keyframed track: [time, value] pairs sorted by time, eased between
 * neighbours. Timelines stay legible as a list of poses instead of a stack of
 * overlapping smoothsteps.
 */
export function track(value: number, frames: [number, number][]) {
    if (value <= frames[0][0]) {
        return frames[0][1];
    }

    for (let index = 1; index < frames.length; index += 1) {
        const [time, target] = frames[index];

        if (value <= time) {
            const [previousTime, previousValue] = frames[index - 1];

            return lerp(previousValue, target, smoothstep(previousTime, time, value));
        }
    }

    return frames[frames.length - 1][1];
}

/**
 * Reads a looping keyframed track with continuous speed: a Catmull-Rom through
 * the frames, wrapping at both ends.
 *
 * `track` eases between each pair of frames, which means it decelerates to a
 * dead stop on every single frame and re-accelerates out of it. That stepping
 * is exactly what makes keyframed motion read as a robot. This carries speed
 * through the frames, and through the loop point.
 *
 * Frames must span 0 -> 1 and start and end on the same value.
 */
export function cycle(value: number, frames: [number, number][]) {
    const last = frames.length - 1;

    if (value <= frames[0][0]) {
        return frames[0][1];
    }

    if (value >= frames[last][0]) {
        return frames[last][1];
    }

    let index = 1;

    while (index < last && value > frames[index][0]) {
        index += 1;
    }

    const [t0, v0] = frames[index - 1];
    const [t1, v1] = frames[index];
    const span = t1 - t0;

    // Neighbours give the tangents. Past either end we borrow the frame from
    // the far side of the loop, shifted by one period, so the wrap is smooth.
    const before: [number, number] =
        index >= 2 ? frames[index - 2] : [frames[last - 1][0] - 1, frames[last - 1][1]];
    const after: [number, number] =
        index + 1 <= last ? frames[index + 1] : [frames[1][0] + 1, frames[1][1]];

    const m0 = ((v1 - before[1]) / (t1 - before[0])) * span;
    const m1 = ((after[1] - v0) / (after[0] - t0)) * span;

    const u = (value - t0) / span;
    const u2 = u * u;
    const u3 = u2 * u;

    return (
        (2 * u3 - 3 * u2 + 1) * v0 +
        (u3 - 2 * u2 + u) * m0 +
        (-2 * u3 + 3 * u2) * v1 +
        (u3 - u2) * m1
    );
}

/**
 * Reads a looping track like `cycle`, but scales its swing around the
 * resting value it starts and ends on rather than the raw number.
 *
 * A weight like a rally's `power` has to vary the effort a pose puts into
 * its motion, not the stance it settles back to — scaling the raw value
 * would make that stance pop every time one rally hands off to the next at
 * a different power.
 */
export function weighted(value: number, frames: [number, number][], power: number) {
    const rest = frames[0][1];

    return rest + (cycle(value, frames) - rest) * power;
}

/**
 * Frame-rate independent approach, so the same easing holds at 30 and 144fps.
 * `smoothing` is the fraction of the remaining distance left after one second.
 */
export function damp(current: number, target: number, smoothing: number, delta: number) {
    return lerp(target, current, Math.pow(smoothing, delta));
}

/**
 * Deterministic pseudo-random in 0 -> 1 from an integer. Rhythm has to vary
 * without being random at runtime: the same rally index has to produce the
 * same rally on every machine, on every reload, or the ball stops meeting the
 * racket.
 */
export function hash(seed: number) {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;

    return value - Math.floor(value);
}

/**
 * Smooth 1D value noise. Stacked sines are the usual way to fake irregularity,
 * but any two of them drift in and out of phase, so the result has a period of
 * its own that the eye finds within a few seconds. This has none.
 */
export function noise(value: number) {
    const cell = Math.floor(value);
    const t = value - cell;

    return lerp(hash(cell), hash(cell + 1), t * t * (3 - 2 * t)) * 2 - 1;
}

/**
 * Re-times a 0 -> 1 clock without moving its ends: above 0 the first half runs
 * ahead and the second half drags, below 0 the reverse. Same keyframes, and a
 * different rhythm through them, which is far cheaper than a second timeline.
 *
 * Monotonic while `bias` stays under 1, so the clock never runs backwards.
 */
export function warp(value: number, bias: number) {
    return value + (Math.sin(value * Math.PI * 2) * bias) / (Math.PI * 2);
}
