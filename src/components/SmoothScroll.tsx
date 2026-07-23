"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerSmoothScroll } from "@/lib/smoothScroll";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

export default function SmoothScroll() {
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (prefersReducedMotion) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.05,
            easing: (progress) => 1 - Math.pow(1 - progress, 3),
            smoothWheel: true,
            // Touch devices already scroll smoothly; hijacking them costs more
            // than it gives and makes the scrubbed scenes feel rubbery.
            syncTouch: false,
            autoRaf: false,
        });

        registerSmoothScroll(lenis);

        let frame = requestAnimationFrame(function step(time: number) {
            lenis.raf(time);
            frame = requestAnimationFrame(step);
        });

        return () => {
            cancelAnimationFrame(frame);
            registerSmoothScroll(null);
            lenis.destroy();
        };
    }, [prefersReducedMotion]);

    return null;
}
