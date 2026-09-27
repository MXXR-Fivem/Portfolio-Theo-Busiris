"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows, PerformanceMonitor } from "@react-three/drei";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";
import { SCENE_READY } from "@/components/three/sceneReady";
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
    /** Aim point; the default camera would otherwise stare at the origin. */
    lookAt?: [number, number, number];
    capability: DeviceCapability;
    /** Looping scenes render every frame; a still scene could set this false. */
    animated?: boolean;
    fog?: [number, number];
    /** Scenes that light themselves (the day/night desk) opt out of the rig. */
    lights?: boolean;
    shadow?: ShadowSettings | false;
    className?: string;
};

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

/**
 * Tells the page when there is something on the canvas to look at. Runs ahead
 * of the render pass, so the event goes out on the frame after the first one
 * was drawn, not on the frame it is drawn in.
 */
function ReadySignal() {
    const canvas = useThree((state) => state.gl.domElement);
    const sent = useRef(false);

    useFrame(() => {
        if (sent.current) {
            return;
        }

        sent.current = true;
        requestAnimationFrame(() =>
            canvas.dispatchEvent(new Event(SCENE_READY, { bubbles: true }))
        );
    });

    return null;
}

export default function Stage({
    children,
    camera,
    lookAt,
    capability,
    animated = true,
    fog = [8, 26],
    lights = true,
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
            onCreated={({ camera: created }) => {
                if (lookAt) {
                    created.lookAt(lookAt[0], lookAt[1], lookAt[2]);
                }
            }}
        >
            <fog attach="fog" args={[PAPER, fog[0], fog[1]]} />

            <PerformanceMonitor onIncline={() => setDpr([1, 2])} onDecline={() => setDpr(1)}>
                <AdaptiveDpr />
            </PerformanceMonitor>

            {/* Warm key, sage bounce. Never a neutral showroom rig. */}
            {lights ? (
                <>
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
                </>
            ) : null}

            {children}
            <ReadySignal />

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
