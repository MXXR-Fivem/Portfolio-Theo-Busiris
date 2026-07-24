"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import SceneMount from "@/components/three/SceneMount";
import CatsStill from "@/components/three/about/CatsStill";

const CatsScene = dynamic(() => import("@/components/three/about/CatsScene"), {
    ssr: false,
});

/**
 * Its own client island so the About section stays a server component. The two
 * cats walk on a loop of their own; the band only decides when to mount them.
 */
export default function AboutCats() {
    const bandRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={bandRef} className="pointer-events-none mt-1 h-[12vh] w-full lg:mt-2 lg:h-[15vh]">
            <SceneMount sectionRef={bandRef} fallback={<CatsStill />} className="h-full">
                {(capability) => <CatsScene capability={capability} />}
            </SceneMount>
        </div>
    );
}
