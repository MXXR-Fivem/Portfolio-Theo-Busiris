"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Stage from "@/components/three/Stage";
import Cat from "@/components/three/about/Cat";
import type { CatHandle } from "@/components/three/about/Cat";
import { lerp } from "@/components/three/anim";
import type { ScrollProgress } from "@/hooks/useSectionProgress";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";

/** Full leg cycles across the section. */
const STEPS = 7;

function Walk({ progress }: { progress: ScrollProgress }) {
    const leader = useRef<CatHandle>(null);
    const follower = useRef<CatHandle>(null);
    const viewport = useThree((state) => state.viewport);

    useFrame(() => {
        const current = progress.current;
        const phase = current * STEPS * Math.PI * 2;

        // The band is far wider than it is tall, and its aspect changes a lot
        // between phone and desktop, so the walk spans the visible width.
        const edge = viewport.width / 2 + 1.4;

        leader.current?.applyPose({
            x: lerp(-edge, edge, current),
            z: 0.1,
            phase,
        });

        // The second cat trails a body behind and out of step.
        follower.current?.applyPose({
            x: lerp(-edge - 1.3, edge - 1.3, current),
            z: -0.5,
            phase: phase + Math.PI * 0.6,
        });
    });

    return (
        <group>
            {/* White cat with a dark-grey tail and a small patch on the crown. */}
            <Cat
                ref={leader}
                coat="#f1eee4"
                belly="#ffffff"
                tail="#4a4d45"
                crownPatch="#4a4d45"
            />
            {/* Dark tabby: lighter-grey banding, beige bib, short single tail. */}
            <Cat
                ref={follower}
                coat="#565b50"
                belly="#c9c0a6"
                stripes="#868c7e"
                shortTail
                scale={0.88}
            />
        </group>
    );
}

export default function CatsScene({
    progress,
    capability,
}: {
    progress: ScrollProgress;
    capability: DeviceCapability;
}) {
    return (
        <Stage
            camera={{ position: [0, 0.72, 4.6], fov: 22 }}
            lookAt={[0, 0.45, 0]}
            capability={capability}
            progress={progress}
            fog={[4, 8.5]}
            shadow={{ position: [0, 0, 0], scale: 4, opacity: 0.2, blur: 3 }}
        >
            <Walk progress={progress} />
        </Stage>
    );
}
