"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows, PerformanceMonitor } from "@react-three/drei";
import type { ScrollProgress } from "@/hooks/useSectionProgress";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";
import { PAPER, shadowTexture } from "@/components/three/toon";

type ShadowSettings = {
    position?: [number, number, number];
    scale?: number;
    opacity?: number;
    blur?: number;
};

type StageProps = {
    children: ReactNode;
    camera: { position: [number, number, number]; fov: number };
    capability: DeviceCapability;
    /** Scroll-driven scenes redraw on demand; looping ones need every frame. */
    animated?: boolean;
    progress?: ScrollProgress;
    fog?: [number, number];
    shadow?: ShadowSettings | false;
    className?: string;
};

/** Turns scroll movement into exactly one requested frame. */
function ProgressInvalidator({ progress }: { progress: ScrollProgress }) {
    const invalidate = useThree((state) => state.invalidate);

    useEffect(() => progress.subscribe(invalidate), [progress, invalidate]);

    return null;
}

/**
 * A blurred disc instead of drei's ContactShadows on weaker devices:
 * ContactShadows re-renders the whole scene into a texture every frame.
 */
function ShadowBlob({
    position = [0, 0, 0],
    scale = 4,
    opacity = 0.3,
}: ShadowSettings) {
    return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={shadowTexture()}
                transparent
                opacity={opacity}
                depthWrite={false}
                color="#6f7566"
            />
        </mesh>
    );
}

export default function Stage({
    children,
    camera,
    capability,
    animated = false,
    progress,
    fog = [8, 26],
    shadow = {},
    className,
}: StageProps) {
    const [dpr, setDpr] = useState<number | [number, number]>([1, 2]);
    const isFull = capability === "full";

    return (
        <Canvas
            className={className}
            camera={{ ...camera, near: 0.5, far: 40 }}
            dpr={dpr}
            frameloop={animated ? "always" : "demand"}
            // Antialiasing is redundant once the renderer is above 1.5x, and
            // it is the first thing worth dropping on a phone.
            gl={{
                alpha: true,
                antialias: isFull,
                powerPreference: "high-performance",
            }}
            resize={{ scroll: false }}
            style={{ pointerEvents: "none" }}
        >
            <fog attach="fog" args={[PAPER, fog[0], fog[1]]} />

            <PerformanceMonitor onDecline={() => setDpr(1)}>
                <AdaptiveDpr />
            </PerformanceMonitor>

            {progress ? <ProgressInvalidator progress={progress} /> : null}

            {/* Warm key, sage bounce. Never a neutral showroom rig. */}
            <ambientLight intensity={0.85} color="#fdf6e8" />
            <hemisphereLight
                args={["#f3ead8", "#b6c4a4", 0.7]}
                position={[0, 6, 0]}
            />
            <directionalLight
                position={[4, 7, 5]}
                intensity={1.15}
                color="#ffe7bd"
            />

            {children}

            {shadow === false ? null : isFull ? (
                <ContactShadows
                    position={shadow.position ?? [0, 0, 0]}
                    scale={shadow.scale ?? 12}
                    opacity={shadow.opacity ?? 0.35}
                    blur={shadow.blur ?? 2.8}
                    far={4}
                    resolution={256}
                    color="#4a5142"
                />
            ) : (
                <ShadowBlob {...shadow} />
            )}
        </Canvas>
    );
}
