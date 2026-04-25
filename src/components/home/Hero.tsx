"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaGithub, FaLinkedinIn, FaFutbol } from "react-icons/fa6";
import { LuMessageSquareCode } from "react-icons/lu";
import { HiOutlineArrowDownTray, HiOutlinePlayCircle } from "react-icons/hi2";
import { BiTennisBall } from "@react-icons/all-files/bi/BiTennisBall";
import Interview from "@/components/Interview";
import { profile } from "@/data/site";

const sceneBubbles = [
    {
        label: "API-driven",
        detail: "Backend logic",
        className: "bubble-a left-2 top-6 sm:left-8",
        tone: "border-[var(--identity-border-strong)] bg-[var(--identity-accent-quiet)] text-cyan-100",
    },
    {
        label: "UX-aware",
        detail: "Clean interfaces",
        className: "bubble-b right-2 top-14 sm:right-8",
        tone: "border-[var(--color-line)] bg-[var(--color-card-subtle)] text-slate-100",
    },
    {
        label: "Padel mindset",
        detail: "Precision",
        className: "bubble-c bottom-16 left-4 sm:left-10",
        tone: "border-[var(--identity-border-strong)] bg-[var(--color-card-subtle)] text-lime-100",
        icon: <BiTennisBall className="text-lime-300" />,
    },
    {
        label: "Team rhythm",
        detail: "Fast iteration",
        className: "bubble-d bottom-8 right-3 sm:right-10",
        tone: "border-[var(--color-line)] bg-[var(--color-card-subtle)] text-sky-100",
        icon: <FaFutbol className="text-sky-300" />,
    },
];

function FloatingBubble({
    label,
    detail,
    className,
    tone,
    icon,
}: {
    label: string;
    detail: string;
    className: string;
    tone: string;
    icon?: ReactNode;
}) {
    return (
        <div
            className={`absolute z-20 max-w-[7.25rem] rounded-[var(--identity-radius-card)] border px-2 py-1.5 text-[0.58rem] shadow-[var(--shadow-float)] sm:max-w-[9rem] sm:px-2.5 sm:py-2 sm:text-[0.65rem] lg:max-w-[11rem] lg:px-4 lg:py-3 lg:text-xs ${tone} ${className}`}
        >
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-semibold">{label}</span>
            </div>
            <p className="mt-0.5 text-[0.56rem] text-current/70 sm:text-[0.62rem] lg:mt-1 lg:text-[0.7rem]">{detail}</p>
        </div>
    );
}

function HeroScene() {
    return (
        <div className="relative mx-auto min-h-[18.25rem] w-full max-w-[28rem] overflow-hidden rounded-[var(--identity-radius-panel)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-2.5 shadow-[var(--shadow-float)] sm:min-h-[15rem] md:min-h-[22rem] lg:min-h-[33rem] lg:max-w-[35rem] lg:p-5">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:42px_42px] opacity-70" />

            <div className="absolute left-1/2 top-1/2 z-10 w-[76%] max-w-[18rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[#091821] shadow-[var(--shadow-float)] lg:max-w-[22rem]">
                <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2 lg:gap-2 lg:px-4 lg:py-3">
                    <span className="h-2 w-2 rounded-full bg-rose-400 lg:h-2.5 lg:w-2.5" />
                    <span className="h-2 w-2 rounded-full bg-amber-300 lg:h-2.5 lg:w-2.5" />
                    <span className="h-2 w-2 rounded-full bg-emerald-300 lg:h-2.5 lg:w-2.5" />
                    <span className="ml-auto font-mono text-[0.55rem] uppercase tracking-[0.18em] text-slate-500 lg:text-[0.65rem] lg:tracking-[0.22em]">
                        portfolio.tsx
                    </span>
                </div>
                <div className="relative min-h-[8.8rem] p-2.5 font-mono text-[0.58rem] leading-4 text-slate-300 sm:min-h-[10rem] sm:p-3 sm:text-[0.62rem] md:min-h-[11rem] lg:min-h-[15rem] lg:p-5 lg:text-xs lg:leading-6">
                    <div className="code-scan absolute inset-x-0 top-0 h-19 bg-gradient-to-b from-cyan-300/0 via-cyan-300/10 to-cyan-300/0" />
                    <p><span className="text-violet-300">const</span> profile = {"{"}</p>
                    <p className="pl-4"><span className="text-cyan-300">school:</span> "Epitech Paris",</p>
                    <p className="pl-4"><span className="text-cyan-300">focus:</span> ["fullstack", "mobile", "backend"],</p>
                    <p className="pl-4"><span className="text-cyan-300">goal:</span> "ship useful products",</p>
                    <p>{"};"}</p>
                    <div className="mt-1.5 rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-1.5 sm:mt-2 sm:p-2 lg:mt-5 lg:p-3">
                        <p className="text-slate-400">status</p>
                        <p className="text-cyan-200">building real projects</p>
                    </div>
                </div>
            </div>

            {sceneBubbles.map((bubble) => (
                <FloatingBubble key={bubble.label} {...bubble} />
            ))}
        </div>
    );
}

export default function Hero() {
    const [showInterview, setShowInterview] = useState(false);

    return (
        <section id="top" className="section-shell snap-section hero-section justify-center">
            <div className="grid translate-y-0 items-center gap-4 sm:translate-y-6 md:translate-y-0 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
                <div className="mx-auto w-full max-w-[34rem] space-y-2.5 text-left md:max-w-[36rem] lg:mx-0 lg:max-w-none lg:space-y-8">
                    <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-3">
                        <span className="section-label">Available for internships and product work</span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-slate-400 lg:px-3 lg:text-xs lg:tracking-[0.24em]">
                            Epitech Paris
                        </span>
                    </div>

                    <div className="space-y-2.5 lg:space-y-6">
                        <div className="flex items-center gap-3 lg:gap-5">
                            <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-14 sm:w-14 lg:h-20 lg:w-20 lg:rounded-2xl">
                                <Image
                                    src="/cv.jpeg"
                                    alt="Portrait of Theo Busiris"
                                    fill
                                    priority
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400 lg:text-base lg:tracking-[0.3em]">
                                    {profile.location}
                                </p>
                                <p className="text-sm text-slate-200 lg:text-lg">{profile.role}</p>
                            </div>
                        </div>

                        <h1 className="max-w-4xl text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-7xl">
                            {profile.heroTitle}
                        </h1>
                        <p className="max-w-2xl text-balance text-xs leading-5 text-slate-300 sm:text-sm md:text-base lg:text-xl lg:leading-8">
                            {profile.heroDescription}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:justify-center lg:justify-start lg:gap-4">
                        <Link
                            href="#projects"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-2 text-xs font-semibold text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-300/18 lg:px-6 lg:py-3 lg:text-sm"
                        >
                            View projects
                            <FaArrowRight />
                        </Link>
                        <Link
                            href="#contact"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:border-white/25 hover:bg-white/8 lg:px-6 lg:py-3 lg:text-sm"
                        >
                            Contact me
                            <LuMessageSquareCode />
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowInterview(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-xs font-semibold text-lime-100 transition hover:border-lime-200/50 hover:bg-lime-300/15 lg:px-6 lg:py-3 lg:text-sm"
                        >
                            Interview
                            <HiOutlinePlayCircle className="text-lg" />
                        </button>
                        <Link
                            href={profile.cv}
                            target="_blank"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-2 text-xs font-semibold text-sky-100 transition hover:border-sky-200/40 hover:bg-sky-300/15 lg:px-6 lg:py-3 lg:text-sm"
                        >
                            Download CV
                            <HiOutlineArrowDownTray />
                        </Link>
                    </div>

                    <div className="hidden flex-wrap items-center gap-3 lg:flex">
                        <Link
                            href={profile.github}
                            target="_blank"
                            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07]"
                        >
                            <FaGithub className="text-base" />
                            GitHub
                        </Link>
                        <Link
                            href={profile.linkedin}
                            target="_blank"
                            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07]"
                        >
                            <FaLinkedinIn className="text-base" />
                            LinkedIn
                        </Link>
                        <Link
                            href={`mailto:${profile.email}`}
                            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07]"
                        >
                            {profile.email}
                        </Link>
                    </div>
                </div>

                <div>
                    <HeroScene />
                </div>
            </div>

            {showInterview && <Interview onClick={() => setShowInterview(false)} />}
        </section>
    );
}
