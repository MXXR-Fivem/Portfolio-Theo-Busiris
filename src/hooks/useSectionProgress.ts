"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * Normalized 0 -> 1 travel of a pinned section, readable from a render loop.
 *
 * The value never goes through React state: scenes read `current` inside
 * useFrame, and `subscribe` exists so a Canvas running on frameloop="demand"
 * can ask for a frame only when the scroll actually moved.
 */
export type ScrollProgress = {
    readonly current: number;
    subscribe: (listener: () => void) => () => void;
};

type ProgressStore = ScrollProgress & {
    set: (value: number) => void;
};

function createProgressStore(): ProgressStore {
    const listeners = new Set<() => void>();
    let value = 0;

    return {
        get current() {
            return value;
        },
        set(next: number) {
            if (next === value) {
                return;
            }

            value = next;
            listeners.forEach((listener) => listener());
        },
        subscribe(listener: () => void) {
            listeners.add(listener);

            return () => {
                listeners.delete(listener);
            };
        },
    };
}

function clamp01(value: number) {
    return value < 0 ? 0 : value > 1 ? 1 : value;
}

/**
 * Maps the scroll position to how far a tall section has travelled behind its
 * sticky child. A section exactly one viewport tall has no travel, so it falls
 * back to how far it has crossed the viewport.
 */
export default function useSectionProgress(
    sectionRef: RefObject<HTMLElement | null>
): ScrollProgress {
    const storeRef = useRef<ProgressStore | null>(null);

    if (storeRef.current === null) {
        storeRef.current = createProgressStore();
    }

    const store = storeRef.current;

    useEffect(() => {
        const section = sectionRef.current;

        if (!section) {
            return;
        }

        let frame: number | null = null;

        function measure() {
            const element = sectionRef.current;

            if (!element) {
                return;
            }

            const viewportHeight = window.innerHeight;
            const rect = element.getBoundingClientRect();
            const travel = rect.height - viewportHeight;

            if (travel > 1) {
                store.set(clamp01(-rect.top / travel));
                return;
            }

            // Short section: progress spans entry to exit of the viewport.
            const span = viewportHeight + rect.height;
            store.set(clamp01((viewportHeight - rect.top) / span));
        }

        function requestMeasure() {
            if (frame !== null) {
                return;
            }

            frame = requestAnimationFrame(() => {
                frame = null;
                measure();
            });
        }

        measure();

        window.addEventListener("scroll", requestMeasure, { passive: true });
        window.addEventListener("resize", requestMeasure);

        const observer = new ResizeObserver(requestMeasure);
        observer.observe(section);

        return () => {
            if (frame !== null) {
                cancelAnimationFrame(frame);
            }

            window.removeEventListener("scroll", requestMeasure);
            window.removeEventListener("resize", requestMeasure);
            observer.disconnect();
        };
    }, [sectionRef, store]);

    return store;
}
