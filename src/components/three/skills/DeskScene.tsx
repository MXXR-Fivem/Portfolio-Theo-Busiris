"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AmbientLight, DirectionalLight, Mesh, MeshToonMaterial, PointLight } from "three";
import Stage from "@/components/three/Stage";
import Desk from "@/components/three/skills/Desk";
import DeskPerson from "@/components/three/skills/DeskPerson";
import type { DeskPersonHandle } from "@/components/three/skills/DeskPerson";
import { track } from "@/components/three/anim";
import type { ScrollProgress } from "@/hooks/useSectionProgress";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";

/**
 * The whole story is in the light: one day compressed into the section.
 * Warm at dawn, white at noon, orange at dusk, blue at night, and then the
 * screen takes over as the only thing still lighting the desk.
 */
const DAYLIGHT: [number, string][] = [
    [0, "#ffcb96"],
    [0.28, "#fff5e6"],
    [0.55, "#ff9c58"],
    [0.78, "#5e7cc4"],
    [1, "#42538f"],
];

const AMBIENT: [number, string][] = [
    [0, "#ffe9cf"],
    [0.28, "#fff8ee"],
    [0.55, "#ffd6b4"],
    [0.78, "#6d7fae"],
    [1, "#4a5680"],
];

const daylightIntensity: [number, number][] = [
    [0, 0.8],
    [0.28, 1.35],
    [0.55, 0.95],
    [0.78, 0.22],
    [1, 0.12],
];

const ambientIntensity: [number, number][] = [
    [0, 0.75],
    [0.28, 0.95],
    [0.55, 0.7],
    [0.78, 0.34],
    [1, 0.26],
];

const glowIntensity: [number, number][] = [
    [0, 0.1],
    [0.5, 0.35],
    [0.75, 1.2],
    [1, 2.1],
];

const screenEmissive: [number, number][] = [
    [0, 0.04],
    [0.55, 0.18],
    [0.8, 0.7],
    [1, 1],
];

/** Left to right across the desk, dipping towards the horizon at dusk. */
const sunX: [number, number][] = [
    [0, -5],
    [1, 5],
];

const sunY: [number, number][] = [
    [0, 1.9],
    [0.28, 5.2],
    [0.55, 2.1],
    [0.78, 3],
    [1, 3.4],
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

function Workstation({ progress }: { progress: ScrollProgress }) {
    const person = useRef<DeskPersonHandle>(null);
    const screen = useRef<Mesh>(null);
    const sun = useRef<DirectionalLight>(null);
    const ambient = useRef<AmbientLight>(null);
    const glow = useRef<PointLight>(null);

    const scratch = useMemo(() => new THREE.Color(), []);

    useFrame((state) => {
        const current = progress.current;
        const time = state.clock.elapsedTime;

        // Typing runs on the clock, not the scroll: the point is that it never
        // stops, whatever hour the light says it is.
        person.current?.applyPose({ phase: time * 7.5, sway: time * 0.8 });

        if (sun.current) {
            sun.current.position.set(
                track(current, sunX),
                track(current, sunY),
                2.6 - current * 1.4
            );
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

        const material = screen.current?.material as MeshToonMaterial | undefined;

        if (material) {
            material.emissive.set("#a9cbe8");
            material.emissiveIntensity = track(current, screenEmissive);
        }
    });

    return (
        <group position={[0, -0.75, 0]}>
            <ambientLight ref={ambient} />
            <directionalLight ref={sun} castShadow={false} />
            <pointLight ref={glow} position={[0, 1.5, -0.1]} color="#bcd9ff" distance={5} />

            <Desk ref={screen} />
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
