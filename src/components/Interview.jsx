"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Interview({ onClick }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const dialog = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4"
            onClick={onClick}
            role="presentation"
        >
            <div
                className="relative w-full max-w-[32rem] overflow-hidden rounded-[var(--identity-radius-panel)] border border-[var(--color-line)] bg-[var(--color-card)] shadow-[var(--shadow-glow)]"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Interview video"
            >
                <button
                    type="button"
                    className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-[var(--identity-radius-control)] border border-[var(--color-line)] bg-[var(--color-card-strong)] text-lg text-white transition hover:border-[var(--identity-border-strong)] focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                    onClick={onClick}
                    aria-label="Fermer"
                >
                    ✕
                </button>
                <div className="flex items-center justify-center bg-transparent">
                    <video
                        autoPlay
                        loop
                        controls
                        preload="metadata"
                        className="block h-auto w-full max-w-[30rem] bg-transparent object-contain"
                    >
                        <source src="/interview.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>
        </div>
    );

    if (!mounted) {
        return null;
    }

    return createPortal(dialog, document.body);
}
