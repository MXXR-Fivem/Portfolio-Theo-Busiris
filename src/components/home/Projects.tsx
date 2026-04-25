"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaArrowRight, FaGithub, FaHeart } from "react-icons/fa6";
import SectionIntro from "@/components/home/SectionIntro";
import { projects, type Project } from "@/data/site";

type SwipeState =
    | "idle"
    | "swipe-out-next"
    | "swipe-in-next"
    | "swipe-out-prev"
    | "swipe-in-prev";

function ProjectCard({ project }: { project: Project }) {
    return (
        <article className="group overflow-hidden rounded-[var(--identity-radius-panel)] border border-[var(--color-line)] bg-[var(--color-card)] p-3.5 shadow-[var(--shadow-glow)] sm:p-[1.1rem] lg:p-8">
            <div className="grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(18rem,1fr)] md:items-center lg:grid-cols-[minmax(0,0.92fr)_minmax(26rem,1fr)] lg:gap-6">
                <div className="flex min-w-0 flex-col gap-2.5 lg:gap-4">
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                        <span
                            className="inline-flex rounded-[var(--identity-radius-control)] bg-[var(--identity-accent-primary)] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-950 lg:px-3 lg:text-[0.72rem] lg:tracking-[0.28em]"
                        >
                            {project.featured ? "Featured project" : "Project"}
                        </span>
                        <span className="hidden text-xs text-slate-400 sm:inline sm:text-sm">{project.tagline}</span>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-white sm:text-2xl lg:text-3xl">
                            {project.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-5 text-slate-300 sm:text-sm lg:mt-3 lg:text-base lg:leading-6">
                            {project.summary}
                        </p>
                    </div>

                    <div className="hidden gap-2.5 md:grid md:grid-cols-2 lg:gap-3">
                        <div className="rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3 lg:p-3.5">
                            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-slate-400 lg:text-xs lg:tracking-[0.28em]">
                                Objective
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-slate-300 lg:mt-2 lg:text-sm lg:leading-6">
                                {project.problem}
                            </p>
                        </div>
                        <div className="rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3 lg:p-3.5">
                            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-slate-400 lg:text-xs lg:tracking-[0.28em]">
                                Result / learning
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-slate-300 lg:mt-2 lg:text-sm lg:leading-6">
                                {project.outcome}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 lg:gap-2">
                        {project.stack.map((item) => (
                            <span
                                key={item}
                                className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-slate-200 lg:px-3 lg:py-1.5 lg:text-sm"
                            >
                                {item}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:gap-3">
                        {project.liveUrl && (
                            <Link
                                href={project.liveUrl}
                                target="_blank"
                                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3.5 py-2 text-xs font-semibold text-cyan-50 transition hover:border-cyan-200/50 hover:bg-cyan-300/16 lg:px-4 lg:py-2.5 lg:text-sm"
                            >
                                Live demo / details
                                <FaArrowRight />
                            </Link>
                        )}
                        {project.githubUrl && (
                            <Link
                                href={project.githubUrl}
                                target="_blank"
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08] lg:px-4 lg:py-2.5 lg:text-sm"
                            >
                                GitHub
                                <FaGithub />
                            </Link>
                        )}
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-mesh">
                    <div className="absolute inset-x-6 top-6 h-px bg-[var(--identity-accent-primary)] opacity-70" />
                    <div className="relative p-2.5 lg:p-3">
                        <div className="relative aspect-[16/8] overflow-hidden rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[#091821] md:aspect-[16/9] lg:aspect-[16/10]">
                            <Image
                                src={project.image}
                                alt={`${project.title} preview`}
                                fill
                                className="object-contain p-2 transition duration-500 group-hover:scale-[1.025] sm:p-3 lg:p-4"
                                sizes="(max-width: 1023px) 100vw, 46vw"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function Projects() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipeState, setSwipeState] = useState<SwipeState>("idle");
    const [isAnimating, setIsAnimating] = useState(false);
    const project = projects[currentIndex];

    function navigate(direction: "next" | "prev") {
        if (isAnimating) {
            return;
        }

        const nextIndex =
            direction === "next"
                ? (currentIndex + 1) % projects.length
                : (currentIndex - 1 + projects.length) % projects.length;

        setIsAnimating(true);
        setSwipeState(direction === "next" ? "swipe-out-next" : "swipe-out-prev");

        window.setTimeout(() => {
            setCurrentIndex(nextIndex);
            setSwipeState(direction === "next" ? "swipe-in-next" : "swipe-in-prev");
        }, 260);

        window.setTimeout(() => {
            setSwipeState("idle");
            setIsAnimating(false);
        }, 560);
    }

    return (
        <section id="projects" className="section-shell snap-section">
            <div className="space-y-3 lg:space-y-7">
                <SectionIntro
                    eyebrow="Projects"
                    title="A selection of products, experiments and systems that reflect how I like to build."
                    description=""
                    align="center"
                />

                <div className="mx-auto max-w-6xl lg:max-w-[79rem]">
                    <div className="relative overflow-hidden px-0 py-1 sm:px-2 lg:px-3 lg:py-2">
                        <div className={`project-swipe-card ${swipeState}`}>
                            <ProjectCard project={project} />
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-4 lg:mt-4 lg:gap-5">
                        <button
                            type="button"
                            onClick={() => navigate("prev")}
                            disabled={isAnimating}
                            aria-label="Previous project"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-base text-slate-100 shadow-[var(--identity-shadow-float)] transition hover:border-white/25 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60 lg:h-14 lg:w-14 lg:text-lg"
                        >
                            <FaArrowLeft />
                        </button>

                        <div className="min-w-20 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-center font-mono text-[0.68rem] uppercase tracking-[0.18em] text-slate-400 lg:min-w-24 lg:px-4 lg:text-xs lg:tracking-[0.22em]">
                            {currentIndex + 1} / {projects.length}
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("next")}
                            disabled={isAnimating}
                            aria-label="Next project"
                            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-rose-300/25 bg-rose-500/12 text-xl text-rose-300 shadow-[0_18px_45px_rgba(244,63,94,0.18)] transition hover:border-rose-200/50 hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:opacity-60 lg:h-16 lg:w-16 lg:text-2xl"
                        >
                            <FaHeart />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
