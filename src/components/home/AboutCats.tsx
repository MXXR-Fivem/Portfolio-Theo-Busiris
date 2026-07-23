"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import SceneMount from "@/components/three/SceneMount";
import CatsStill from "@/components/three/about/CatsStill";
import useSectionProgress from "@/hooks/useSectionProgress";

const CatsScene = dynamic(() => import("@/components/three/about/CatsScene"), {
    ssr: false,
});

/**
 * Kept as its own client island so the About section stays a server component:
 * the band measures its own crossing of the viewport as the walk progress.
 */
export default function AboutCats() {
    const bandRef = useRef<HTMLDivElement>(null);
    const progress = useSectionProgress(bandRef);

    return (
        <div ref={bandRef} className="pointer-events-none h-[18vh] w-full lg:h-[24vh]">
            <SceneMount
                sectionRef={bandRef}
                fallback={<CatsStill />}
                className="h-full"
            >
                {(capability) => (
                    <CatsScene progress={progress} capability={capability} />
                )}
            </SceneMount>
        </div>
    );
}
