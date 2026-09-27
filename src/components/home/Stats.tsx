"use client";

import { useEffect, useRef, useState } from "react";
import SectionIntro from "@/components/home/SectionIntro";
import { proofPoints } from "@/data/site";
import useCountUp from "@/hooks/useCountUp";
import useInViewport from "@/hooks/useInViewport";

type TebexStats = {
    totalSales: number;
    totalCustomers: number;
};

type StatsState = {
    loading: boolean;
    error: boolean;
    data: TebexStats | null;
};

function formatNumber(value?: number) {
    if (typeof value !== "number") {
        return "--";
    }

    return new Intl.NumberFormat("en-US").format(value);
}

function StatusPill({ state }: { state: StatsState }) {
    // A single accent means the states read through wording and weight, not hue.
    const quiet =
        "inline-flex w-fit rounded-full border border-[var(--color-line)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-text-soft)] lg:text-xs lg:tracking-[0.24em]";
    const live =
        "inline-flex w-fit rounded-full bg-[var(--identity-accent-quiet)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-accent-ink)] lg:text-xs lg:tracking-[0.24em]";

    if (state.loading) {
        return <span className={quiet}>Loading live data</span>;
    }

    if (state.error) {
        return <span className={quiet}>Live API unavailable</span>;
    }

    return <span className={live}>Updated automatically</span>;
}

export default function Stats() {
    const section = useRef<HTMLElement>(null);
    // Negative margin so the figures wait until the panel is properly on screen
    // instead of counting up behind the fold.
    const inViewport = useInViewport(section, { rootMargin: "-15% 0px" });
    const [state, setState] = useState<StatsState>({
        loading: true,
        error: false,
        data: null,
    });

    useEffect(() => {
        let active = true;

        async function loadStats() {
            try {
                const response = await fetch("/api/tebex/stats", {
                    method: "GET",
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("Unable to fetch Tebex stats");
                }

                const data: TebexStats = await response.json();

                if (!active) {
                    return;
                }

                setState({
                    loading: false,
                    error: false,
                    data,
                });
            } catch {
                if (!active) {
                    return;
                }

                setState({
                    loading: false,
                    error: true,
                    data: null,
                });
            }
        }

        loadStats();

        return () => {
            active = false;
        };
    }, []);

    // Both figures run up from zero once the section arrives, a beat apart so
    // the pair reads as two numbers landing rather than one block changing.
    const customers = useCountUp(state.data?.totalCustomers, inViewport);
    const sales = useCountUp(state.data?.totalSales, inViewport, 160);

    const stats = [
        {
            label: "Customers served",
            value: formatNumber(customers),
            helper: "Unique buyers from completed Tebex payments.",
        },
        {
            label: "Sales completed",
            value: formatNumber(sales),
            helper: "Live FiveM store sales volume.",
        },
    ];

    return (
        <section id="proof" ref={section} className="section-shell">
            <div className="section-panel grid gap-3 p-3.5 sm:p-[1.1rem] md:grid-cols-[1.05fr_0.75fr] lg:grid-cols-[0.5fr_0.5fr] lg:gap-8 lg:p-10">
                <div className="space-y-3">
                    <SectionIntro
                        eyebrow="Proof"
                        title="Products that real people already pay for."
                        description="Live metrics and customer feedback from my FiveM store: delivery, support and iteration, well past school projects."
                    />
                    <div className="pt-1">
                        <StatusPill state={state} />
                    </div>
                </div>

                <div className="grid h-full grid-cols-2 gap-2 md:grid-cols-1 lg:gap-4 lg:grid-rows-2">
                    {stats.map((item, index) => (
                        <div
                            key={item.label}
                            className="relative flex min-h-[5.5rem] flex-col justify-start overflow-hidden md:justify-center rounded-[var(--identity-radius-card)] border border-[var(--color-line)] border-t-[var(--identity-accent-line)] bg-[var(--color-card-subtle)] p-3.5 pt-[1.1rem] lg:min-h-[8.5rem] lg:p-5 lg:pt-6"
                        >
                            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-text-soft)] lg:text-xs lg:tracking-[0.24em]">
                                {item.label}
                            </p>
                            <p className="mt-2 font-mono text-2xl font-medium text-[var(--color-ink)] lg:mt-4 lg:text-5xl">
                                {item.value}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)] lg:mt-3 lg:text-sm lg:leading-6">
                                {state.error ? "Data temporarily unavailable." : item.helper}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-2 md:col-span-2 md:grid-cols-2 lg:gap-4">
                    {proofPoints.map((point, index) => (
                        <div
                            key={point.title}
                            className={`rounded-[var(--identity-radius-card)] border p-3.5 lg:p-5 ${index === 0 ? "border-[var(--identity-border-strong)] bg-[var(--identity-accent-quiet)]" : "border-[var(--color-line)] bg-[var(--color-card-subtle)]"}`}
                        >
                            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-accent-ink)] lg:text-xs lg:tracking-[0.28em]">
                                {point.eyebrow}
                            </p>
                            <h3 className="mt-1.5 text-sm font-semibold text-[var(--color-ink)] lg:mt-3 lg:text-xl">
                                {point.title}
                            </h3>
                            <p className="mt-1.5 text-xs leading-5 text-[var(--color-ink-soft)] lg:mt-3 lg:text-sm lg:leading-7">
                                {point.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
