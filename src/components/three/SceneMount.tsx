"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
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
};

/**
 * Waits until the page is done loading and the main thread is free, so a
 * canvas above the fold never competes with first paint.
 */
function useIdleAfterLoad() {
    const [isIdle, setIsIdle] = useState(false);

    useEffect(() => {
        let idleHandle: number | null = null;
        let timeout: number | null = null;

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

        if (document.readyState === "complete") {
            scheduleIdle();
        } else {
            window.addEventListener("load", scheduleIdle, { once: true });
        }

        return () => {
            window.removeEventListener("load", scheduleIdle);

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
}: SceneMountProps) {
    const capability = useDeviceCapability();
    const prefersReducedMotion = usePrefersReducedMotion();
    const isInViewport = useInViewport(sectionRef);
    const isIdle = useIdleAfterLoad();
    const [isRevealed, setIsRevealed] = useState(false);
    const revealFrame = useRef<number | null>(null);

    const canRender =
        capability !== "unknown" &&
        capability !== "none" &&
        !prefersReducedMotion &&
        isInViewport &&
        isIdle;

    useEffect(() => {
        if (!canRender) {
            setIsRevealed(false);
            return;
        }

        revealFrame.current = requestAnimationFrame(() => setIsRevealed(true));

        return () => {
            if (revealFrame.current !== null) {
                cancelAnimationFrame(revealFrame.current);
            }
        };
    }, [canRender]);

    return (
        <div className={`relative ${className ?? ""}`}>
            <div
                aria-hidden={canRender}
                // Fades out faster than the canvas fades in, so the two
                // never sit on top of each other as a double exposure.
                className={`transition-opacity duration-300 ${
                    isRevealed ? "opacity-0" : "opacity-100"
                }`}
            >
                {fallback}
            </div>

            {canRender ? (
                <div
                    className={`absolute inset-0 transition-opacity duration-700 delay-150 ${
                        isRevealed ? "opacity-100" : "opacity-0"
                    }`}
                >
                    {children(capability)}
                </div>
            ) : null}
        </div>
    );
}
