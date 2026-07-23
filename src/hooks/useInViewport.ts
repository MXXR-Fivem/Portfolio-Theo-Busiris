"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

type Options = {
    /** Grows the detection box so a scene can boot slightly before it is seen. */
    rootMargin?: string;
};

/**
 * Only one 3D scene should ever be mounted at a time; this is what decides it.
 */
export default function useInViewport(
    targetRef: RefObject<HTMLElement | null>,
    { rootMargin = "20% 0px" }: Options = {}
) {
    const [isInViewport, setIsInViewport] = useState(false);

    useEffect(() => {
        const target = targetRef.current;

        if (!target) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => setIsInViewport(entry.isIntersecting),
            { rootMargin }
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [targetRef, rootMargin]);

    return isInViewport;
}
