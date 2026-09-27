"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { SCENE_READY } from "@/components/three/sceneReady";
import useInViewport from "@/hooks/useInViewport";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import useDeviceCapability from "@/hooks/useDeviceCapability";
import type { DeviceCapability } from "@/hooks/useDeviceCapability";

type SceneMountProps = {
    /** Receives the resolved capability so the scene can size its own budget. */
    children: (capability: DeviceCapability) => ReactNode;
    fallback: ReactNode;
    sectionRef: RefObject<HTMLElement | null>;
    className?: string;
    /**
     * The fallback is a frame of the scene itself, so the two swap in a single
     * frame. A fade would lay one semi-transparent net over the other, and the
     * stage would flash as it went through.
     */
    seamless?: boolean;
};

/**
 * Waits until the page is done loading and the main thread is free, so a
 * canvas above the fold never competes with first paint.
 *
 * On small screens it waits for a gesture on top of that. There the 3D is a
 * watermark behind the text, and paying for WebGL before the reader has even
 * moved is the wrong trade: they get the static art until they scroll.
 */
function useIdleAfterLoad() {
    const [isIdle, setIsIdle] = useState(false);

    useEffect(() => {
        let idleHandle: number | null = null;
        let timeout: number | null = null;
        const wantsGesture = !window.matchMedia("(min-width: 1024px)").matches;
        const gestures = ["pointerdown", "touchstart", "wheel", "keydown", "scroll"] as const;

        function releaseGestures() {
            gestures.forEach((gesture) =>
                window.removeEventListener(gesture, onGesture)
            );
        }

        function onGesture() {
            releaseGestures();
            scheduleIdle();
        }

        function scheduleIdle() {
            const idleWindow = window as Window & {
                requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
                cancelIdleCallback?: (handle: number) => void;
            };

            if (idleWindow.requestIdleCallback) {
                idleHandle = idleWindow.requestIdleCallback(() => setIsIdle(true), {
                    timeout: 1200,
                });
                return;
            }

            timeout = window.setTimeout(() => setIsIdle(true), 200);
        }

        function start() {
            if (!wantsGesture) {
                scheduleIdle();
                return;
            }

            gestures.forEach((gesture) =>
                window.addEventListener(gesture, onGesture, { once: true, passive: true })
            );
        }

        if (document.readyState === "complete") {
            start();
        } else {
            window.addEventListener("load", start, { once: true });
        }

        return () => {
            window.removeEventListener("load", start);
            releaseGestures();

            const idleWindow = window as Window & {
                cancelIdleCallback?: (handle: number) => void;
            };

            if (idleHandle !== null) {
                idleWindow.cancelIdleCallback?.(idleHandle);
            }

            if (timeout !== null) {
                window.clearTimeout(timeout);
            }
        };
    }, []);

    return isIdle;
}

/**
 * Single gate for every 3D section: capability, reduced motion, viewport and
 * page load all have to agree before a canvas is mounted, and only the section
 * currently on screen keeps one alive.
 */
export default function SceneMount({
    children,
    fallback,
    sectionRef,
    className,
    seamless = false,
}: SceneMountProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const isInViewport = useInViewport(sectionRef);
    const isIdle = useIdleAfterLoad();
    const capability = useDeviceCapability(
        isIdle && isInViewport && !prefersReducedMotion
    );
    const [isRevealed, setIsRevealed] = useState(false);
    const stageRef = useRef<HTMLDivElement>(null);

    const canRender =
        capability !== "unknown" &&
        capability !== "none" &&
        !prefersReducedMotion &&
        isInViewport &&
        isIdle;

    // The scene chunk loads after this mounts. Revealing on a timer would fade
    // the fallback out while the stage is still empty, so wait for the canvas
    // to say it has drawn.
    useEffect(() => {
        const stage = stageRef.current;

        if (!canRender || !stage) {
            setIsRevealed(false);
            return;
        }

        const reveal = () => setIsRevealed(true);

        stage.addEventListener(SCENE_READY, reveal);

        return () => stage.removeEventListener(SCENE_READY, reveal);
    }, [canRender]);

    return (
        <div className={`relative ${className ?? ""}`}>
            <div
                aria-hidden={canRender}
                // Fades out faster than the canvas fades in, so the two
                // never sit on top of each other as a double exposure.
                className={`h-full ${seamless ? "" : "transition-opacity duration-300"} ${
                    isRevealed ? "opacity-0" : "opacity-100"
                }`}
            >
                {fallback}
            </div>

            {canRender ? (
                <div
                    ref={stageRef}
                    className={`absolute inset-0 ${
                        seamless ? "" : "transition-opacity delay-150 duration-700"
                    } ${isRevealed ? "opacity-100" : "opacity-0"}`}
                >
                    {children(capability)}
                </div>
            ) : null}
        </div>
    );
}
