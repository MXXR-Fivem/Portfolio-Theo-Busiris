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
import type { DeviceCapability } from "@/hooks/useDeviceCapability";

/** Seconds for one full day-and-night, looped seamlessly (night == night). */
const PERIOD = 13;

/**
 * The whole story is in the light. The cycle is a closed loop: deep night at
 * both ends, dawn, a bright noon that lands on the desk, a golden afternoon, an
 * amber (not red) dusk, and back to night where the two screens are the only
 * thing still lighting the desk.
 */
const DAYLIGHT: [number, string][] = [
    [0, "#33406e"],
    [0.12, "#ffcf9a"],
    [0.3, "#fff2df"],
    [0.5, "#fffaf0"],
    [0.68, "#ffd39a"],
    [0.82, "#efb066"],
    [0.92, "#5d6c9c"],
    [1, "#33406e"],
];

const AMBIENT: [number, string][] = [
    [0, "#2f3a5e"],
    [0.12, "#ffe6cf"],
    [0.5, "#fff8ee"],
    [0.68, "#ffdfbb"],
    [0.82, "#e6c199"],
    [0.92, "#4c5980"],
    [1, "#2f3a5e"],
];

const daylightIntensity: [number, number][] = [
    [0, 0.1],
    [0.12, 0.7],
    [0.3, 1.2],
    [0.5, 1.6],
    [0.68, 1.1],
    [0.82, 0.62],
    [0.92, 0.2],
    [1, 0.1],
];

const ambientIntensity: [number, number][] = [
    [0, 0.2],
    [0.12, 0.72],
    [0.5, 0.95],
    [0.68, 0.72],
    [0.82, 0.46],
    [0.92, 0.26],
    [1, 0.2],
];

const rayIntensity: [number, number][] = [
    [0, 0],
    [0.2, 0.18],
    [0.42, 0.32],
    [0.5, 0.32],
    [0.66, 0.24],
    [0.78, 0.06],
    [0.86, 0],
    [1, 0],
];

const RAY_WARM: [number, string][] = [
    [0.2, "#fff4d6"],
    [0.46, "#ffe7b6"],
    [0.68, "#ffc888"],
    [0.82, "#ffb771"],
];

// The shafts lean from one side, up through vertical, then to the other side.
const rayTilt: [number, number][] = [
    [0.1, 0.6],
    [0.5, 0],
    [0.85, -0.6],
    [1, -0.6],
];

const rayShift: [number, number][] = [
    [0.1, -0.7],
    [0.5, 0.3],
    [0.85, 1.3],
    [1, 1.3],
];

const glowIntensity: [number, number][] = [
    [0, 2.1],
    [0.16, 0.55],
    [0.5, 0.2],
    [0.8, 0.6],
    [0.9, 1.4],
    [1, 2.1],
];

const screenEmissive: [number, number][] = [
    [0, 1.05],
    [0.16, 0.35],
    [0.5, 0.1],
    [0.8, 0.5],
    [0.92, 0.9],
    [1, 1.05],
];

// The desk lamp: dark by day, warm and glowing through the night.
const lampGlow: [number, number][] = [
    [0, 1.1],
    [0.14, 0.15],
    [0.5, 0],
    [0.82, 0.3],
    [0.92, 0.95],
    [1, 1.1],
];

const lampLightIntensity: [number, number][] = [
    [0, 1.7],
    [0.14, 0.15],
    [0.5, 0],
    [0.84, 0.5],
    [0.92, 1.4],
    [1, 1.7],
];

const sunX: [number, number][] = [
    [0, -6],
    [0.5, 0],
    [0.9, 6],
    [1, -6],
];

const sunY: [number, number][] = [
    [0, 1.4],
    [0.5, 5.4],
    [0.9, 1.4],
    [1, 1.4],
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

/** A soft-edged vertical streak, so a ray plane fades out instead of a hard bar. */
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
            const vertical = Math.pow(1 - y / height, 1.4);

            for (let x = 0; x < width; x += 1) {
                const dx = (x - width / 2) / (width / 2);
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

function Workstation() {
    const person = useRef<DeskPersonHandle>(null);
    const sun = useRef<DirectionalLight>(null);
    const ambient = useRef<AmbientLight>(null);
    const glow = useRef<PointLight>(null);
    const lamp = useRef<PointLight>(null);
    const rays = useRef<THREE.Group>(null);

    const scratch = useMemo(() => new THREE.Color(), []);

    const screenMaterial = useMemo(() => {
        const material = toonMaterial("#cdd9de").clone();
        material.emissive = new THREE.Color("#a9cbe8");
        return material;
    }, []);

    const lampMaterial = useMemo(() => {
        const material = toonMaterial("#d8c79c").clone();
        material.emissive = new THREE.Color("#ffcf87");
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
        // Offset so the section is first seen in daytime, not at midnight.
        const current = (state.clock.elapsedTime / PERIOD + 0.22) % 1;
        const time = state.clock.elapsedTime;

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
        lampMaterial.emissiveIntensity = track(current, lampGlow);

        if (lamp.current) {
            lamp.current.intensity = track(current, lampLightIntensity);
        }

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
            <pointLight ref={glow} position={[0.2, 1.5, -0.1]} color="#bcd9ff" distance={5} />
            <pointLight ref={lamp} position={[-0.6, 1.02, 0.1]} color="#ffcf8f" distance={3.2} />

            <SunRays material={rayMaterial} texture={rayTexture} groupRef={rays} />
            <Desk screenMaterial={screenMaterial} lampMaterial={lampMaterial} />
            <DeskPerson ref={person} />
        </group>
    );
}

export default function DeskScene({ capability }: { capability: DeviceCapability }) {
    return (
        <Stage
            camera={{ position: [0, 4.4, 4.3], fov: 28 }}
            lookAt={[0, 0.3, 0.05]}
            capability={capability}
            animated
            lights={false}
            fog={[6.5, 13]}
            shadow={{ position: [0, -0.75, 0.2], scale: 6, opacity: 0.24, blur: 3 }}
        >
            <Workstation />
        </Stage>
    );
}
