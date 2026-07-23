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
            <Cat ref={leader} coat="#b8a68d" belly="#efe7d8" />
            <Cat ref={follower} coat="#6f7566" belly="#cfd4c2" scale={0.88} />
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
            camera={{ position: [0, 0.7, 3.9], fov: 22 }}
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
