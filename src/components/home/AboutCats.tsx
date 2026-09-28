"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import SceneMount from "@/components/three/SceneMount";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import CatsStill from "@/components/three/about/CatsStill";

const loadCatsScene = () => import("@/components/three/about/CatsScene");
const CatsScene = dynamic(loadCatsScene, { ssr: false });

/**
 * Its own client island so the About section stays a server component. The two
 * cats run their own loop; the band only decides when to mount them.
 */
export default function AboutCats() {
    const bandRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div ref={bandRef} className="pointer-events-none mt-1 h-[12vh] w-full lg:mt-2 lg:h-[15vh]">
            <SceneMount
                sectionRef={bandRef}
                // The cats run in from off-screen, so until they do the band is
                // empty; the standing pair is only for those who never get them.
                fallback={prefersReducedMotion ? <CatsStill /> : null}
                className="h-full"
                // Nothing sits under the canvas to cross-fade with, and the
                // cats enter from off-screen, so a fade only delays them.
                seamless
                preload={loadCatsScene}
            >
                {(capability) => <CatsScene capability={capability} />}
            </SceneMount>
        </div>
    );
}
