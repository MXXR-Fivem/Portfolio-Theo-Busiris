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
        <article className="project-card group overflow-hidden rounded-[var(--identity-radius-panel)] border border-[var(--color-line)] bg-[var(--color-card)] p-3.5 shadow-[var(--shadow-glow)] sm:p-[1.1rem] lg:p-8">
            <div className="project-card-grid grid gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(18rem,1fr)] md:items-center lg:grid-cols-[minmax(0,0.92fr)_minmax(26rem,1fr)] lg:gap-6">
                <div className="project-card-copy flex min-w-0 flex-col gap-2.5 lg:gap-4">
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                        <span
                            className="project-card-pill inline-flex rounded-[var(--identity-radius-control)] bg-[var(--identity-accent-quiet)] px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--color-accent-ink)] lg:px-3 lg:text-[0.72rem] lg:tracking-[0.28em]"
                        >
                            {project.featured ? "Featured project" : "Project"}
                        </span>
                        <span className="text-xs text-[var(--color-text-soft)] sm:text-sm">{project.tagline}</span>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-[var(--color-ink)] sm:text-2xl lg:text-3xl">
                            {project.title}
                        </h3>
                        <p className="project-card-summary mt-1.5 text-xs leading-5 text-[var(--color-ink-soft)] sm:text-sm lg:mt-3 lg:text-base lg:leading-6">
                            {project.summary}
                        </p>
                    </div>

                    <div className="project-card-details grid gap-2.5 md:grid-cols-2 lg:gap-3">
                        <div className="project-card-objective rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3 lg:p-3.5">
                            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--color-text-soft)] lg:text-xs lg:tracking-[0.28em]">
                                Objective
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-[var(--color-ink-soft)] lg:mt-2 lg:text-sm lg:leading-6">
                                {project.problem}
                            </p>
                        </div>
                        <div className="rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3 lg:p-3.5">
                            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--color-text-soft)] lg:text-xs lg:tracking-[0.28em]">
                                Result / learning
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-[var(--color-ink-soft)] lg:mt-2 lg:text-sm lg:leading-6">
                                {project.outcome}
                            </p>
                        </div>
                    </div>

                    <div className="project-card-stack flex flex-wrap gap-1.5 lg:gap-2">
                        {project.stack.map((item) => (
                            <span
                                key={item}
                                className="rounded-full border border-[var(--color-line)] bg-[var(--color-card)] px-2.5 py-1 text-xs text-[var(--color-ink)] lg:px-3 lg:py-1.5 lg:text-sm"
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
                                className="inline-flex items-center gap-2 rounded-full border border-[var(--identity-accent-line)] bg-[var(--identity-accent-quiet)] px-3.5 py-2 text-xs font-semibold text-[var(--color-accent-ink)] transition hover:border-[var(--identity-accent-line)] hover:bg-[var(--identity-accent-quiet)] lg:px-4 lg:py-2.5 lg:text-sm"
                            >
                                Live demo / details
                                <FaArrowRight />
                            </Link>
                        )}
                        {project.githubUrl && (
                            <Link
                                href={project.githubUrl}
                                target="_blank"
                                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-card)] px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-line)] hover:bg-[var(--color-card)] lg:px-4 lg:py-2.5 lg:text-sm"
                            >
                                GitHub
                                <FaGithub />
                            </Link>
                        )}
                    </div>
                </div>

                <div className="project-card-media relative overflow-hidden rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-mesh">
                    <div className="absolute inset-x-6 top-6 h-px bg-[var(--identity-accent-line)]" />
                    <div className="relative p-2.5 lg:p-3">
                        <div className="project-card-image-frame relative aspect-[16/8] overflow-hidden rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--identity-bg-soft)] md:aspect-[16/9] lg:aspect-[16/10]">
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
        <section id="projects" className="section-shell">
            <div className="projects-content space-y-3 lg:space-y-7">
                <SectionIntro
                    eyebrow="Projects"
                    title="Products, experiments and systems I have shipped."
                    description=""
                    align="center"
                />

                <div className="mx-auto max-w-6xl lg:max-w-[86.9rem]">
                    <div className="relative overflow-hidden px-0 py-1 sm:px-2 lg:px-3 lg:py-2">
                        <div className={`project-swipe-card ${swipeState}`}>
                            <ProjectCard project={project} />
                        </div>
                    </div>

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
                    >
                        {projects.map((preloadedProject) => (
                            <Image
                                key={preloadedProject.slug}
                                src={preloadedProject.image}
                                alt=""
                                width={900}
                                height={560}
                                // Warming the carousel is not worth competing with
                                // the fonts and the first paint for bandwidth.
                                loading="lazy"
                                sizes="(max-width: 1023px) 100vw, 46vw"
                            />
                        ))}
                    </div>

                    <div className="project-controls mt-3 flex items-center justify-center gap-4 lg:mt-4 lg:gap-5">
                        <button
                            type="button"
                            onClick={() => navigate("prev")}
                            disabled={isAnimating}
                            aria-label="Previous project"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-card)] text-base text-[var(--color-ink)] shadow-[var(--identity-shadow-float)] transition hover:border-[var(--color-line)] hover:bg-[var(--color-card)] disabled:cursor-not-allowed disabled:opacity-60 lg:h-14 lg:w-14 lg:text-lg"
                        >
                            <FaArrowLeft />
                        </button>

                        <div className="min-w-20 rounded-full border border-[var(--color-line)] bg-[var(--color-card)] px-3 py-2 text-center font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-text-soft)] lg:min-w-24 lg:px-4 lg:text-xs lg:tracking-[0.22em]">
                            {currentIndex + 1} / {projects.length}
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("next")}
                            disabled={isAnimating}
                            aria-label="Next project"
                            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--identity-accent-line)] bg-[var(--identity-accent-quiet)] text-xl text-[var(--color-accent-ink)] shadow-[var(--shadow-float)] transition hover:border-[var(--identity-accent-line)] hover:bg-[var(--identity-accent-quiet)] disabled:cursor-not-allowed disabled:opacity-60 lg:h-16 lg:w-16 lg:text-2xl"
                        >
                            <FaHeart />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
