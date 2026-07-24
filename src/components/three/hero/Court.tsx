"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { geometries, toonMaterial } from "@/components/three/toon";

const NET_WIDTH = 5.6;
const NET_HEIGHT = 0.92;

/** The mesh as one textured plane: a grid of real bars would cost hundreds of draws. */
function useNetTexture() {
    return useMemo(() => {
        const size = 128;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext("2d");

        if (context) {
            context.clearRect(0, 0, size, size);
            context.strokeStyle = "rgba(43, 46, 42, 0.42)";
            context.lineWidth = 3;

            for (let i = 0; i <= 8; i += 1) {
                const step = (i / 8) * size;

                context.beginPath();
                context.moveTo(step, 0);
                context.lineTo(step, size);
                context.stroke();

                context.beginPath();
                context.moveTo(0, step);
                context.lineTo(size, step);
                context.stroke();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 1.5);

        return texture;
    }, []);
}

const postMaterial = toonMaterial("#5b5f57");
const bandMaterial = toonMaterial("#fbfaf6");

export default function Court() {
    const netTexture = useNetTexture();

    return (
        <group>
            <mesh position={[0, NET_HEIGHT / 2, 0]}>
                <planeGeometry args={[NET_WIDTH, NET_HEIGHT]} />
                <meshBasicMaterial
                    map={netTexture}
                    transparent
                    opacity={0.38}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh
                geometry={geometries.box}
                material={bandMaterial}
                position={[0, NET_HEIGHT, 0]}
                scale={[NET_WIDTH, 0.07, 0.05]}
            />

            {/* A post at each end of the net, with a small foot. */}
            {[-1, 1].map((side) => (
                <group key={side} position={[(side * NET_WIDTH) / 2, 0, 0]}>
                    <mesh
                        geometry={geometries.cylinder}
                        material={postMaterial}
                        position={[0, (NET_HEIGHT + 0.12) / 2, 0]}
                        scale={[0.11, NET_HEIGHT + 0.12, 0.11]}
                    />
                    <mesh
                        geometry={geometries.cylinder}
                        material={postMaterial}
                        position={[0, 0.02, 0]}
                        scale={[0.24, 0.05, 0.24]}
                    />
                </group>
            ))}
        </group>
    );
}
