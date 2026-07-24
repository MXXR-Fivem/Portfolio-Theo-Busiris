"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import Stage from "@/components/three/Stage";
import Cat from "@/components/three/about/Cat";
import type { CatHandle } from "@/components/three/about/Cat";
import { lerp, smoothstep } from "@/components/three/anim";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";

const CYCLE = 7;
/** Leg cycles per world unit travelled, so the gait speeds up with the cat. */
const STEP_PER_UNIT = 0.5;
const TAU = Math.PI * 2;

/**
 * The first 30% of the crossing is a walk; then they break into a run and the
 * grey cat chases the white one down, closing the gap.
 */
function traverse(tt: number) {
    const walkPath = 0.3;
    const walkTime = 0.55;

    if (tt < walkTime) {
        return (tt / walkTime) * walkPath;
    }

    return walkPath + ((tt - walkTime) / (1 - walkTime)) * (1 - walkPath);
}

function Walk() {
    const leader = useRef<CatHandle>(null);
    const follower = useRef<CatHandle>(null);
    const viewport = useThree((state) => state.viewport);

    useFrame((state) => {
        const span = viewport.width + 4;
        const edge = viewport.width / 2 + 2;

        const tt = (state.clock.elapsedTime / CYCLE) % 1;
        const d = traverse(tt);
        const whiteX = -edge + d * span;

        // The white leaves first (big gap, so the grey is not hidden behind it),
        // then the grey closes in as they run.
        const gap = lerp(2.4, 0.95, smoothstep(0.3, 0.72, d));
        const greyX = whiteX - gap;

        leader.current?.applyPose({
            x: whiteX,
            z: 0.1,
            phase: whiteX * STEP_PER_UNIT * TAU,
        });

        follower.current?.applyPose({
            x: greyX,
            z: -0.45,
            phase: greyX * STEP_PER_UNIT * TAU + Math.PI * 0.5,
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
