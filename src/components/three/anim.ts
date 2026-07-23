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
 * Frame-rate independent approach, so the same easing holds at 30 and 144fps.
 * `smoothing` is the fraction of the remaining distance left after one second.
 */
export function damp(current: number, target: number, smoothing: number, delta: number) {
    return lerp(target, current, Math.pow(smoothing, delta));
}
