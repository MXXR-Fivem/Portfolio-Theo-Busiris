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
import { profile, ventures } from "@/data/site";

const PadelScene = dynamic(() => import("@/components/three/hero/PadelScene"), {
    ssr: false,
});

export default function Hero() {
    const [showInterview, setShowInterview] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <section ref={sectionRef} id="top" className="relative overflow-hidden max-lg:pb-0 max-md:pt-5 md:max-lg:pt-7">
            {/* Shares the section's leftover height with the scene below
                (3x its weight) so the words settle a little below the top edge
                instead of sitting flush against it. Kept modest on purpose: a
                bigger share for the scene leaves less margin against a mobile
                browser's own address-bar animations, which is what was
                overrunning the section and breaking the snap scroll. Desktop
                centres the column on its own, so this drops out of flow there. */}
            <div aria-hidden="true" className="flex-1 lg:hidden" />

            <div className="section-shell relative flex w-full items-center">
                {/* Lifted clear of the vertical centre. The court behind it is
                    positioned off the section, not off this column, so it stays
                    where it is. Below lg the court sits under it instead, so the
                    column packs tight to leave the scene room. */}
                <div className="relative z-10 mx-auto w-full max-w-[34rem] space-y-3.5 text-left md:max-w-[36rem] md:space-y-4 lg:mx-0 lg:max-w-[38rem] lg:-translate-y-[5%] lg:space-y-7">
                        {/* One row: the company badge rides with the labels
                            rather than costing the hero a whole line of height. */}
                        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2.5">
                            <span className="section-label">Open to internships</span>
                            <span className="quiet-pill text-[0.65rem] uppercase tracking-[0.18em] lg:tracking-[0.24em]">
                                Epitech Paris
                            </span>

                            <div aria-hidden="true" className="h-0 basis-full" />

                            {/* The companies sit with them, not under them: it is
                                the one line here that says the most. One bubble
                                each, so a second company never has to share a
                                role with the first. */}
                            {ventures.map((venture) => {
                                const badge = (
                                    <>
                                        <Image
                                            src={venture.logo}
                                            alt={venture.showName ? "" : venture.name}
                                            width={venture.logoWidth}
                                            height={venture.logoHeight}
                                            priority
                                            className={venture.showName ? "h-3 w-auto lg:h-3.5" : "h-2.5 w-auto lg:h-3"}
                                        />
                                        {venture.showName ? (
                                            <span className="text-[0.78rem] font-semibold tracking-tight text-[var(--color-ink)] lg:text-[0.84rem]">
                                                {venture.name}
                                            </span>
                                        ) : null}
                                        <span className="h-3 w-px bg-[var(--color-line)]" />
                                        <span className="text-[0.68rem] font-medium text-[var(--color-ink)] lg:text-[0.72rem]">
                                            {venture.role}
                                        </span>
                                    </>
                                );
                                const shape =
                                    "inline-flex w-fit items-center gap-1.5 rounded-[var(--identity-radius-control)] border border-[var(--color-line)] bg-[var(--color-card)] py-0.5 pl-2.5 pr-3 md:gap-2 md:py-1 md:pl-3 md:pr-3.5";

                                return venture.url ? (
                                    <Link
                                        key={venture.name}
                                        href={venture.url}
                                        target="_blank"
                                        className={`${shape} transition-colors duration-300 hover:border-[var(--identity-accent-line)]`}
                                    >
                                        {badge}
                                    </Link>
                                ) : (
                                    <span key={venture.name} className={shape}>
                                        {badge}
                                    </span>
                                );
                            })}
                        </div>

                        <div className="space-y-3 md:space-y-3 lg:space-y-6">
                            <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
                                <div className="relative h-11 w-11 overflow-hidden rounded-[var(--identity-radius-card)] bg-[var(--identity-bg-muted)] md:h-14 md:w-14 lg:h-[4.5rem] lg:w-[4.5rem]">
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

                            <h1 className="max-w-4xl text-balance text-[1.6rem] font-semibold leading-[1.12] sm:text-5xl lg:text-[3.9rem] lg:leading-[1.08]">
                                {profile.heroTitle}
                            </h1>
                            <p className="max-w-2xl text-balance text-sm leading-5 text-[var(--color-ink-soft)] md:text-base md:leading-6 lg:text-lg lg:leading-8">
                                {profile.heroDescription}
                            </p>
                        </div>

                        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 md:flex md:flex-wrap md:justify-start lg:gap-3">
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
                                className="soft-button px-3 py-2 text-xs sm:px-4 lg:px-5 lg:py-3 lg:text-sm"
                            >
                                <span className="truncate text-xs lg:text-sm">Interview</span>
                                <HiOutlinePlayCircle className="shrink-0 text-base" />
                            </button>
                            <Link
                                href={profile.cv}
                                target="_blank"
                                prefetch={false}
                                className="soft-button px-3 py-2 text-xs sm:px-4 lg:px-5 lg:py-3 lg:text-sm"
                            >
                                <span className="truncate">Download CV</span>
                                <HiOutlineArrowDownTray className="shrink-0" />
                            </Link>
                            <Link
                                href={profile.github}
                                target="_blank"
                                aria-label="GitHub"
                                className="soft-button px-3 py-2 text-xs sm:px-4 lg:hidden"
                            >
                                <FaGithub className="shrink-0 text-base" />
                                <span className="hidden truncate sm:inline">GitHub</span>
                            </Link>
                            <Link
                                href={profile.linkedin}
                                target="_blank"
                                aria-label="LinkedIn"
                                className="soft-button px-3 py-2 text-xs sm:px-4 lg:hidden"
                            >
                                <FaLinkedinIn className="shrink-0 text-base" />
                                <span className="hidden truncate sm:inline">LinkedIn</span>
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

            {/* Full-bleed so the smashed ball can leave the page, not just a boxed
                scene. Below lg it takes whatever height the words and the spacer
                above leave at the bottom of the screen (3x the spacer's share),
                capped so a tall box never crops the net at the sides; desktop
                gives it the whole right half out to the viewport edge. Sits
                directly under the section so it spans to the real right edge,
                not the shell's. */}
            <div className="pointer-events-none relative z-0 max-h-[85vw] min-h-0 flex-[4_1_0%] lg:absolute lg:max-h-none lg:flex-none lg:inset-auto lg:right-0 lg:-top-[6%] lg:-bottom-[6%] lg:w-[62%]">
                {/* Pinned rather than h-full: on tablets the section only has a
                    min height, which a percentage height cannot resolve against.
                    Below lg, the stage is grown past its own box and pulled up
                    by the same amount, so the top ~35% of the shot — empty sky
                    above the player in this camera framing — lands off-screen
                    instead of reading as wasted white space. Cascades into the
                    still (sized off this box already) and the canvas (R3F
                    measures whatever height it is actually given). */}
                <div className="absolute left-0 right-0 max-lg:-top-[62%] max-lg:h-[185%] lg:inset-0">
                    <SceneMount
                        sectionRef={sectionRef}
                        fallback={<PadelStill />}
                        seamless
                        className="h-full"
                    >
                        {(capability) => <PadelScene capability={capability} />}
                    </SceneMount>
                </div>
            </div>

            {showInterview && <Interview onClick={() => setShowInterview(false)} />}
        </section>
    );
}
