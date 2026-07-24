"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AmbientLight, DirectionalLight, MeshBasicMaterial, PointLight } from "three";
import Stage from "@/components/three/Stage";
import Desk from "@/components/three/skills/Desk";
import DeskPerson from "@/components/three/skills/DeskPerson";
import type { DeskPersonHandle } from "@/components/three/skills/DeskPerson";
import { track } from "@/components/three/anim";
import { geometries, toonMaterial } from "@/components/three/toon";
import type { ScrollProgress } from "@/hooks/useSectionProgress";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";

/**
 * The whole story is in the light: one day compressed into the section.
 * Pale morning, then the sun climbs and hits the desk at noon, warms to gold
 * in the afternoon, sinks to orange at dusk and to near-black at night, at
 * which point the two screens are the only thing still lighting the desk.
 */
const DAYLIGHT: [number, string][] = [
    [0, "#ffe2b8"],
    [0.22, "#fff3df"],
    [0.4, "#fffaf0"],
    [0.6, "#ffce93"],
    // A softer amber dusk instead of a hard red.
    [0.78, "#f0a862"],
    [0.9, "#41527f"],
    [1, "#26325a"],
];

const AMBIENT: [number, string][] = [
    [0, "#ffe9cf"],
    [0.4, "#fff8ee"],
    [0.6, "#ffdcb4"],
    [0.78, "#e0b088"],
    [0.9, "#44547e"],
    [1, "#2a3454"],
];

const daylightIntensity: [number, number][] = [
    [0, 0.7],
    [0.22, 1.25],
    [0.4, 1.6],
    [0.6, 1.15],
    [0.78, 0.7],
    [0.9, 0.2],
    [1, 0.08],
];

const ambientIntensity: [number, number][] = [
    [0, 0.72],
    [0.4, 0.95],
    [0.6, 0.72],
    [0.78, 0.44],
    [0.9, 0.24],
    [1, 0.16],
];

/** Warm shafts that appear as the sun climbs and are gone by dusk. */
const rayIntensity: [number, number][] = [
    [0, 0],
    [0.26, 0.22],
    [0.42, 0.34],
    [0.6, 0.26],
    [0.74, 0.08],
    [0.82, 0],
    [1, 0],
];

const RAY_WARM: [number, string][] = [
    [0.2, "#fff4d6"],
    [0.42, "#ffe7b6"],
    [0.66, "#ffc27f"],
    [0.8, "#ffab63"],
];

// As the sun crosses, the shafts lean from one side, up through vertical, then
// over to the other side before the light goes.
const rayTilt: [number, number][] = [
    [0, 0.6],
    [0.4, 0],
    [0.78, -0.6],
    [1, -0.6],
];

const rayShift: [number, number][] = [
    [0, -0.7],
    [0.4, 0.3],
    [0.78, 1.3],
    [1, 1.3],
];

const glowIntensity: [number, number][] = [
    [0, 0.12],
    [0.55, 0.35],
    [0.78, 1],
    [1, 2.2],
];

const screenEmissive: [number, number][] = [
    [0, 0.05],
    [0.55, 0.2],
    [0.82, 0.8],
    [1, 1.1],
];

/** The sun crosses the desk left to right and dips toward the horizon. */
const sunX: [number, number][] = [
    [0, -5.5],
    [1, 5.5],
];

const sunY: [number, number][] = [
    [0, 1.8],
    [0.4, 5.4],
    [0.6, 3],
    [0.78, 1.4],
    [1, 2.6],
];

function sampleColor(stops: [number, string][], value: number, out: THREE.Color) {
    if (value <= stops[0][0]) {
        return out.set(stops[0][1]);
    }

    for (let index = 1; index < stops.length; index += 1) {
        const [time, color] = stops[index];

        if (value <= time) {
            const [previousTime, previousColor] = stops[index - 1];
            const amount = (value - previousTime) / (time - previousTime);

            return out.set(previousColor).lerp(new THREE.Color(color), amount);
        }
    }

    return out.set(stops[stops.length - 1][1]);
}

/** A soft-edged vertical streak, so a ray plane fades out instead of ending
 *  in a hard bar. */
function createRayTexture() {
    const width = 32;
    const height = 128;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (context) {
        const image = context.createImageData(width, height);

        for (let y = 0; y < height; y += 1) {
            // Bright at the top, gone by the bottom.
            const vertical = Math.pow(1 - y / height, 1.4);

            for (let x = 0; x < width; x += 1) {
                const dx = (x - width / 2) / (width / 2);
                // Gaussian across the width for soft side edges.
                const horizontal = Math.exp(-(dx * dx) * 6);
                const value = Math.round(255 * vertical * horizontal);
                const index = (y * width + x) * 4;

                image.data[index] = 255;
                image.data[index + 1] = 255;
                image.data[index + 2] = 255;
                image.data[index + 3] = value;
            }
        }

        context.putImageData(image, 0, 0);
    }

    return new THREE.CanvasTexture(canvas);
}

/** Thin, parallel light shafts; the group is swept over the day by the scene. */
function SunRays({
    material,
    texture,
    groupRef,
}: {
    material: MeshBasicMaterial;
    texture: THREE.Texture;
    groupRef: React.RefObject<THREE.Group | null>;
}) {
    material.map = texture;

    return (
        <group ref={groupRef} position={[0, 1.8, 0]}>
            {[-0.7, -0.5, -0.28, -0.06, 0.18, 0.42, 0.66].map((x, index) => (
                <mesh
                    key={x}
                    geometry={geometries.plane}
                    material={material}
                    position={[x, 0, (index - 3) * 0.05]}
                    scale={[0.12, 3.6, 1]}
                />
            ))}
        </group>
    );
}

function Workstation({ progress }: { progress: ScrollProgress }) {
    const person = useRef<DeskPersonHandle>(null);
    const sun = useRef<DirectionalLight>(null);
    const ambient = useRef<AmbientLight>(null);
    const glow = useRef<PointLight>(null);
    const rays = useRef<THREE.Group>(null);

    const scratch = useMemo(() => new THREE.Color(), []);

    // Both screens share this material so the scene lights them together.
    const screenMaterial = useMemo(() => {
        const material = toonMaterial("#cdd9de").clone();
        material.emissive = new THREE.Color("#a9cbe8");
        return material;
    }, []);

    const rayTexture = useMemo(() => createRayTexture(), []);
    const rayMaterial = useMemo(
        () =>
            new THREE.MeshBasicMaterial({
                color: new THREE.Color("#ffe4ad"),
                transparent: true,
                opacity: 0,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
            }),
        []
    );

    useFrame((state) => {
        const current = progress.current;
        const time = state.clock.elapsedTime;

        // Typing runs on the clock, not the scroll: it never stops, whatever
        // hour the light says it is.
        person.current?.applyPose({ phase: time * 7.5, sway: time * 0.8 });

        if (sun.current) {
            sun.current.position.set(track(current, sunX), track(current, sunY), 2.6 - current * 1.4);
            sun.current.intensity = track(current, daylightIntensity);
            sampleColor(DAYLIGHT, current, scratch);
            sun.current.color.copy(scratch);
        }

        if (ambient.current) {
            ambient.current.intensity = track(current, ambientIntensity);
            sampleColor(AMBIENT, current, scratch);
            ambient.current.color.copy(scratch);
        }

        if (glow.current) {
            glow.current.intensity = track(current, glowIntensity);
        }

        screenMaterial.emissiveIntensity = track(current, screenEmissive);

        rayMaterial.opacity = track(current, rayIntensity);
        sampleColor(RAY_WARM, current, scratch);
        rayMaterial.color.copy(scratch);

        if (rays.current) {
            rays.current.rotation.z = track(current, rayTilt);
            rays.current.position.x = track(current, rayShift);
        }
    });

    return (
        <group position={[0, -0.75, 0]}>
            <ambientLight ref={ambient} />
            <directionalLight ref={sun} castShadow={false} />
            <pointLight ref={glow} position={[0, 1.5, -0.1]} color="#bcd9ff" distance={5} />

            <SunRays material={rayMaterial} texture={rayTexture} groupRef={rays} />
            <Desk screenMaterial={screenMaterial} />
            <DeskPerson ref={person} />
        </group>
    );
}

export default function DeskScene({
    progress,
    capability,
}: {
    progress: ScrollProgress;
    capability: DeviceCapability;
}) {
    return (
        <Stage
            camera={{ position: [0, 4.4, 4.3], fov: 28 }}
            lookAt={[0, 0.3, 0.05]}
            capability={capability}
            progress={progress}
            animated
            lights={false}
            fog={[6.5, 13]}
            shadow={{ position: [0, -0.75, 0.2], scale: 6, opacity: 0.24, blur: 3 }}
        >
            <Workstation progress={progress} />
        </Stage>
    );
}
