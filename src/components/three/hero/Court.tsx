"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { geometries, toonMaterial } from "@/components/three/toon";

/**
 * The left post stands well inside the frame. The stage is cropped by its own
 * box on the left, so a net that ran on past it would end in a hard vertical
 * cut; ending on a post makes the edge of the scene read as the end of the
 * court. The right end keeps running off the screen.
 */
const NET_LEFT = -1.8;
// Far enough right to stay past the frame even on a tall, narrow mobile box,
// whose aspect ratio shows more of the court width than the wide desktop box
// the camera was originally framed against.
const NET_RIGHT = 6;
const NET_WIDTH = NET_RIGHT - NET_LEFT;
const NET_CENTER = (NET_LEFT + NET_RIGHT) / 2;
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
        // Eight cells per 5.6 units, however long the net is.
        texture.repeat.set((NET_WIDTH * 8) / 5.6, 1.5);

        return texture;
    }, []);
}

const postMaterial = toonMaterial("#5b5f57");
const bandMaterial = toonMaterial("#fbfaf6");

export default function Court() {
    const netTexture = useNetTexture();

    return (
        <group>
            <mesh position={[NET_CENTER, NET_HEIGHT / 2, 0]}>
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
                position={[NET_CENTER, NET_HEIGHT, 0]}
                scale={[NET_WIDTH, 0.07, 0.05]}
            />

            {/* A post at each end of the net, the same width top to bottom. */}
            {[NET_LEFT, NET_RIGHT].map((x) => (
                <mesh
                    key={x}
                    geometry={geometries.cylinder}
                    material={postMaterial}
                    position={[x, (NET_HEIGHT + 0.12) / 2, 0]}
                    scale={[0.14, NET_HEIGHT + 0.12, 0.14]}
                />
            ))}
        </group>
    );
}
