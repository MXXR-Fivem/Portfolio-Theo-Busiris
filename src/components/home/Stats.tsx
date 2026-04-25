"use client";

import { useEffect, useState } from "react";
import SectionIntro from "@/components/home/SectionIntro";
import { proofPoints } from "@/data/site";

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
    if (state.loading) {
        return (
            <span className="inline-flex w-fit rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-amber-200 lg:px-3 lg:text-xs lg:tracking-[0.24em]">
                Loading live data
            </span>
        );
    }

    if (state.error) {
        return (
            <span className="inline-flex w-fit rounded-full border border-rose-300/20 bg-rose-300/10 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-rose-200 lg:px-3 lg:text-xs lg:tracking-[0.24em]">
                Live API unavailable
            </span>
        );
    }

    return (
        <span className="inline-flex w-fit rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-emerald-200 lg:px-3 lg:text-xs lg:tracking-[0.24em]">
            Updated automatically
        </span>
    );
}

export default function Stats() {
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

    const stats = [
        {
            label: "Customers served",
            value: formatNumber(state.data?.totalCustomers),
            helper: "Unique buyers from completed Tebex payments.",
        },
        {
            label: "Sales completed",
            value: formatNumber(state.data?.totalSales),
            helper: "Live FiveM store sales volume.",
        },
    ];

    return (
        <section id="proof" className="section-shell snap-section">
            <div className="section-panel grid gap-3 p-3.5 sm:p-[1.1rem] md:grid-cols-[1.05fr_0.75fr] lg:grid-cols-[0.5fr_0.5fr] lg:gap-8 lg:p-10">
                <div className="space-y-3">
                    <SectionIntro
                        eyebrow="Proof"
                        title="Concrete signals that I already work on products used by real people."
                        description="Live business metrics and customer feedback from a real FiveM store, showing product delivery, support and iteration beyond school projects."
                    />
                    <div className="pt-1">
                        <StatusPill state={state} />
                    </div>
                </div>

                <div className="grid h-full grid-cols-2 gap-2 md:grid-cols-1 lg:gap-4 lg:grid-rows-2">
                    {stats.map((item, index) => (
                        <div
                            key={item.label}
                            className="relative flex min-h-[5.5rem] flex-col justify-center overflow-hidden rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3.5 pt-[1.1rem] lg:min-h-[8.5rem] lg:p-5 lg:pt-6"
                        >
                            <div className={`absolute inset-x-0 top-0 h-1 ${index === 0 ? "bg-[var(--identity-accent-primary)]" : "bg-[var(--identity-accent-sport)]"}`} />
                            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-slate-400 lg:text-xs lg:tracking-[0.24em]">
                                {item.label}
                            </p>
                            <p className="mt-2 font-mono text-2xl font-semibold text-white lg:mt-4 lg:text-5xl">
                                {item.value}
                            </p>
                            <p className="mt-1 hidden text-xs leading-5 text-slate-300 sm:block lg:mt-3 lg:text-sm lg:leading-6">
                                {state.error
                                    ? "The API is preserved, but the data is temporarily unavailable."
                                    : item.helper}
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
                            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-cyan-300 lg:text-xs lg:tracking-[0.28em]">
                                {point.eyebrow}
                            </p>
                            <h3 className="mt-1.5 text-sm font-semibold text-white lg:mt-3 lg:text-xl">
                                {point.title}
                            </h3>
                            <p className="mt-1.5 text-xs leading-5 text-slate-300 lg:mt-3 lg:text-sm lg:leading-7">
                                {point.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
