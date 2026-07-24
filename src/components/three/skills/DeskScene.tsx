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
    [0.6, "#ffcf8c"],
    [0.78, "#ff8038"],
    [0.9, "#3b4c7d"],
    [1, "#1e2748"],
];

const AMBIENT: [number, string][] = [
    [0, "#ffe9cf"],
    [0.4, "#fff8ee"],
    [0.6, "#ffdcb4"],
    [0.78, "#e8905a"],
    [0.9, "#40507e"],
    [1, "#232c4e"],
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
    [0.24, 0.32],
    [0.42, 0.5],
    [0.6, 0.4],
    [0.74, 0.12],
    [0.82, 0],
    [1, 0],
];

const RAY_WARM: [number, string][] = [
    [0.2, "#fff2cf"],
    [0.42, "#ffe4ad"],
    [0.66, "#ffb56a"],
    [0.8, "#ff9048"],
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

/** A few slanted translucent planes standing in for volumetric light shafts. */
function SunRays({ material }: { material: MeshBasicMaterial }) {
    return (
        <group position={[0.5, 1.7, -0.1]} rotation={[0, 0, -0.5]}>
            {[-0.55, -0.18, 0.2, 0.6].map((x, index) => (
                <mesh
                    key={x}
                    geometry={geometries.plane}
                    material={material}
                    position={[x, 0, index * 0.12]}
                    scale={[0.16 + index * 0.02, 3.4, 1]}
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

    const scratch = useMemo(() => new THREE.Color(), []);

    // Both screens share this material so the scene lights them together.
    const screenMaterial = useMemo(() => {
        const material = toonMaterial("#cdd9de").clone();
        material.emissive = new THREE.Color("#a9cbe8");
        return material;
    }, []);

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
    });

    return (
        <group position={[0, -0.75, 0]}>
            <ambientLight ref={ambient} />
            <directionalLight ref={sun} castShadow={false} />
            <pointLight ref={glow} position={[0, 1.5, -0.1]} color="#bcd9ff" distance={5} />

            <SunRays material={rayMaterial} />
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
