"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { LuMessageSquareCode } from "react-icons/lu";
import { HiOutlineArrowDownTray, HiOutlinePlayCircle } from "react-icons/hi2";
import Interview from "@/components/Interview";
import SceneMount from "@/components/three/SceneMount";
import PadelStill from "@/components/three/hero/PadelStill";
import useSectionProgress from "@/hooks/useSectionProgress";
import { profile } from "@/data/site";

const PadelScene = dynamic(() => import("@/components/three/hero/PadelScene"), {
    ssr: false,
});

export default function Hero() {
    const [showInterview, setShowInterview] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const progress = useSectionProgress(sectionRef);

    return (
        <section
            ref={sectionRef}
            id="top"
            className="pinned-section relative h-[200vh] lg:h-[260vh]"
        >
            <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
                <div className="section-shell relative grid w-full items-center gap-6 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:pt-16">
                    {/* Mobile: the scene sits behind the words. Desktop: it owns the left column. */}
                    <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.22] lg:relative lg:inset-auto lg:z-auto lg:h-[66vh] lg:opacity-100">
                        <SceneMount
                            sectionRef={sectionRef}
                            fallback={<PadelStill />}
                            className="h-full"
                        >
                            {(capability) => (
                                <PadelScene progress={progress} capability={capability} />
                            )}
                        </SceneMount>
                    </div>

                    <div className="relative z-10 mx-auto w-full max-w-[34rem] space-y-6 text-left md:max-w-[36rem] lg:mx-0 lg:max-w-none lg:space-y-8">
                        <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-3">
                            <span className="section-label">Available for internships and product work</span>
                            <span className="quiet-pill text-[0.65rem] uppercase tracking-[0.18em] lg:tracking-[0.24em]">
                                Epitech Paris
                            </span>
                        </div>

                        <div className="space-y-5 lg:space-y-6">
                            <div className="flex items-center gap-4 lg:gap-5">
                                <div className="relative h-14 w-14 overflow-hidden rounded-[var(--identity-radius-card)] bg-[var(--identity-bg-muted)] lg:h-[4.5rem] lg:w-[4.5rem]">
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
                                    <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-text-soft)] lg:text-sm lg:tracking-[0.3em]">
                                        {profile.location}
                                    </p>
                                    <p className="text-sm text-[var(--color-ink-soft)] lg:text-lg">{profile.role}</p>
                                </div>
                            </div>

                            <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.9rem]">
                                {profile.heroTitle}
                            </h1>
                            <p className="max-w-2xl text-balance text-sm leading-6 text-[var(--color-ink-soft)] md:text-base lg:text-lg lg:leading-8">
                                {profile.heroDescription}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:justify-start lg:gap-3">
                            <Link href="#projects" className="soft-button-accent hidden lg:inline-flex">
                                View projects
                                <FaArrowRight className="shrink-0 text-xs" />
                            </Link>
                            <Link href="#contact" className="soft-button hidden lg:inline-flex">
                                Contact me
                                <LuMessageSquareCode className="shrink-0" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setShowInterview(true)}
                                className="soft-button px-4 py-2.5 text-xs lg:px-5 lg:py-3 lg:text-sm"
                            >
                                <span className="truncate">Interview</span>
                                <HiOutlinePlayCircle className="shrink-0 text-base" />
                            </button>
                            <Link
                                href={profile.cv}
                                target="_blank"
                                prefetch={false}
                                className="soft-button px-4 py-2.5 text-xs lg:px-5 lg:py-3 lg:text-sm"
                            >
                                <span className="truncate">Download CV</span>
                                <HiOutlineArrowDownTray className="shrink-0" />
                            </Link>
                            <Link
                                href={profile.github}
                                target="_blank"
                                className="soft-button px-4 py-2.5 text-xs lg:hidden"
                            >
                                <FaGithub className="shrink-0 text-base" />
                                <span className="truncate">GitHub</span>
                            </Link>
                            <Link
                                href={profile.linkedin}
                                target="_blank"
                                className="soft-button px-4 py-2.5 text-xs lg:hidden"
                            >
                                <FaLinkedinIn className="shrink-0 text-base" />
                                <span className="truncate">LinkedIn</span>
                            </Link>
                        </div>

                        <div className="hidden flex-wrap items-center gap-6 text-sm text-[var(--color-text-soft)] lg:flex">
                            <Link
                                href={profile.github}
                                target="_blank"
                                className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-[var(--color-accent-ink)]"
                            >
                                <FaGithub className="text-base" />
                                GitHub
                            </Link>
                            <Link
                                href={profile.linkedin}
                                target="_blank"
                                className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-[var(--color-accent-ink)]"
                            >
                                <FaLinkedinIn className="text-base" />
                                LinkedIn
                            </Link>
                            <Link
                                href={`mailto:${profile.email}`}
                                className="transition-colors duration-300 hover:text-[var(--color-accent-ink)]"
                            >
                                {profile.email}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {showInterview && <Interview onClick={() => setShowInterview(false)} />}
        </section>
    );
}
