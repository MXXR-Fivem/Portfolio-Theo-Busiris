"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Stage from "@/components/three/Stage";
import Cat from "@/components/three/about/Cat";
import type { CatHandle } from "@/components/three/about/Cat";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";

/** Metres crossed per second, and the leg-cycle rate that matches it. */
const SPEED = 1.1;
const STEP_RATE = 3.2;

function Walk() {
    const leader = useRef<CatHandle>(null);
    const follower = useRef<CatHandle>(null);
    const viewport = useThree((state) => state.viewport);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const phase = time * STEP_RATE * Math.PI * 2;

        // They walk rightward for ever, wrapping off the right edge back to the
        // left, so the loop never resets with a jump.
        const span = viewport.width + 3.2;
        const edge = viewport.width / 2 + 1.6;
        const advance = (time * SPEED) % span;

        leader.current?.applyPose({
            x: -edge + advance,
            z: 0.1,
            phase,
        });

        // The second cat trails a body behind and out of step.
        follower.current?.applyPose({
            x: -edge + ((advance + span - 1.3) % span),
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
                tail="#70746a"
                crownPatch="#4a4d45"
            />
            {/* Dark tabby: lighter-grey banding, darker chest, short single tail. */}
            <Cat
                ref={follower}
                coat="#565b50"
                belly="#8a8574"
                stripes="#868c7e"
                shortTail
                scale={0.88}
            />
        </group>
    );
}

export default function CatsScene({ capability }: { capability: DeviceCapability }) {
    return (
        <Stage
            camera={{ position: [0, 0.72, 4.6], fov: 22 }}
            lookAt={[0, 0.45, 0]}
            capability={capability}
            animated
            fog={[4, 8.5]}
            shadow={{ position: [0, 0, 0], scale: 4, opacity: 0.2, blur: 3 }}
        >
            <Walk />
        </Stage>
    );
}
