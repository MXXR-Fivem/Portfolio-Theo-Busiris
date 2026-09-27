"use client";

import { useEffect, useState } from "react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

const DURATION = 1500;

/** Quick off the mark, then settling, so the last digits land slowly enough to read. */
function easeOut(t: number) {
    return 1 - (1 - t) ** 3;
}

/**
 * Counts up to `target` the first time `active` goes true, and never replays:
 * a number that re-rolls every time the section scrolls past reads as a glitch
 * rather than as an arrival.
 *
 * Returns undefined until there is something to show, so the caller keeps its
 * own placeholder while the API is still answering.
 */
export default function useCountUp(
    target: number | undefined,
    active: boolean,
    /** Milliseconds to hold before starting, to stagger a row of figures. */
    delay = 0
) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [started, setStarted] = useState(false);
    const [value, setValue] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (active) {
            setStarted(true);
        }
    }, [active]);

    useEffect(() => {
        if (!started || typeof target !== "number") {
            return;
        }

        const end = target;

        if (prefersReducedMotion) {
            setValue(end);
            return;
        }

        let frame = 0;
        let startedAt = 0;

        function step(now: number) {
            if (!startedAt) {
                startedAt = now;
            }

            const elapsed = now - startedAt - delay;

            if (elapsed >= DURATION) {
                setValue(end);
                return;
            }

            setValue(Math.round(end * easeOut(Math.max(0, elapsed) / DURATION)));
            frame = requestAnimationFrame(step);
        }

        frame = requestAnimationFrame(step);

        return () => cancelAnimationFrame(frame);
    }, [target, started, delay, prefersReducedMotion]);

    return value;
}
