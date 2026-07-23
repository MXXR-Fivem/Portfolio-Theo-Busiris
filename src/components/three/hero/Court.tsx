"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { INK, SAND, geometries, toonMaterial } from "@/components/three/toon";

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

const postMaterial = toonMaterial(INK);
const bandMaterial = toonMaterial("#fbfaf6");
const lineMaterial = toonMaterial(SAND);

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

            {[-1, 1].map((side) => (
                <mesh
                    key={side}
                    geometry={geometries.cylinder}
                    material={postMaterial}
                    position={[(side * NET_WIDTH) / 2, (NET_HEIGHT + 0.06) / 2, 0]}
                    scale={[0.07, NET_HEIGHT + 0.06, 0.07]}
                />
            ))}

            {/* Two service lines, just enough to say "court" without a floor. */}
            {[-2.6, 2.2].map((z) => (
                <mesh
                    key={z}
                    geometry={geometries.plane}
                    material={lineMaterial}
                    position={[0, 0.01, z]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={[NET_WIDTH * 0.86, 0.05, 1]}
                />
            ))}
        </group>
    );
}
