"use client";

import { useEffect, useState } from "react";

export type DeviceCapability = "unknown" | "none" | "low" | "full";

function detect(): DeviceCapability {
    try {
        const canvas = document.createElement("canvas");
        const context =
            canvas.getContext("webgl2") ||
            canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");

        if (!context) {
            return "none";
        }
    } catch {
        return "none";
    }

    const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = navigatorWithMemory.deviceMemory ?? 4;

    // Old phones: WebGL exists but a toon scene at 60fps does not.
    if (cores <= 2 || memory <= 1) {
        return "none";
    }

    if (cores <= 4 || memory <= 4) {
        return "low";
    }

    return "full";
}

/**
 * "low" still renders, with contact shadows and antialiasing dropped.
 * "none" means the section must show its static fallback instead.
 */
export default function useDeviceCapability() {
    const [capability, setCapability] = useState<DeviceCapability>("unknown");

    useEffect(() => {
        setCapability(detect());
    }, []);

    return capability;
}
