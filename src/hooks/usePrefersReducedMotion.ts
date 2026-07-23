"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export default function usePrefersReducedMotion() {
    // Starts at false so the server markup and the first client paint agree.
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(QUERY);

        function sync() {
            setPrefersReducedMotion(media.matches);
        }

        sync();
        media.addEventListener("change", sync);

        return () => media.removeEventListener("change", sync);
    }, []);

    return prefersReducedMotion;
}
