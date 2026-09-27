"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import SectionIntro from "@/components/home/SectionIntro";
import SceneMount from "@/components/three/SceneMount";
import DeskStill from "@/components/three/skills/DeskStill";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { skillGroups } from "@/data/site";

const DeskScene = dynamic(() => import("@/components/three/skills/DeskScene"), {
    ssr: false,
});

/** How long a card shows its bubbles by itself before moving on. */
const AUTO_CYCLE_MS = 4000;

/** How long after the section settles into view the first card opens. */
const AUTO_START_MS = 500;

/**
 * Cards with a linked project take turns showing it unprompted, so a reader
 * who never hovers still discovers the hint. The first turn comes shortly
 * after the section is reached, not on a clock that started at page load.
 * Never the same card twice in a row, and hovering any card always wins over
 * the timer.
 */
function useAutoCycle(eligible: number[], active: boolean, paused: boolean) {
    const [autoIndex, setAutoIndex] = useState<number | null>(null);
    const pausedRef = useRef(paused);
    pausedRef.current = paused;

    useEffect(() => {
        if (!active || eligible.length === 0) {
            return;
        }

        const advance = () => {
            if (pausedRef.current) {
                return;
            }

            setAutoIndex((current) => {
                const choices = eligible.filter((index) => index !== current);
                return choices[Math.floor(Math.random() * choices.length)] ?? current;
            });
        };

        let cycleId: number | undefined;
        const startId = window.setTimeout(() => {
            advance();
            cycleId = window.setInterval(advance, AUTO_CYCLE_MS);
        }, AUTO_START_MS);

        return () => {
            window.clearTimeout(startId);
            window.clearInterval(cycleId);
            setAutoIndex(null);
        };
        // eligible is stable (derived from static site data), so it is read
        // through the closure rather than restarting the timer on every render.
    }, [active, eligible.length > 0]);

    return autoIndex;
}

/** True once the section fills the screen, i.e. the snap scroll has landed on it. */
function useSettledInView(targetRef: RefObject<HTMLElement | null>) {
    const [settled, setSettled] = useState(false);

    useEffect(() => {
        const target = targetRef.current;

        if (!target) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const fits = Math.min(entry.boundingClientRect.height, window.innerHeight);
                setSettled(entry.intersectionRect.height >= fits * 0.9);
            },
            { threshold: Array.from({ length: 21 }, (_, step) => step / 20) }
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [targetRef]);

    return settled;
}

export default function Skills() {
    const sectionRef = useRef<HTMLElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const settled = useSettledInView(sectionRef);

    const eligible = skillGroups
        .map((group, index) => (group.linkedProjects?.length ? index : -1))
        .filter((index) => index !== -1);

    const autoIndex = useAutoCycle(eligible, settled, hoverIndex !== null || prefersReducedMotion);
    const activeIndex = hoverIndex ?? autoIndex;

    return (
        <section ref={sectionRef} id="skills" className="section-shell relative">
            <div className="flex min-h-0 w-full flex-1 flex-col gap-1.5 md:gap-3 lg:grid lg:flex-none lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-10">
                <div className="relative z-10 space-y-2.5 md:space-y-4 lg:space-y-5">
                    <SectionIntro
                        eyebrow="Skills"
                        title="A practical stack, grouped by how I use it."
                        description=""
                        size="compact"
                    />

                    <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-2 lg:grid-cols-2 lg:gap-2.5">
                        {skillGroups.map((group, index) => (
                            <div
                                key={group.title}
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex((current) => (current === index ? null : current))}
                                className={`relative overflow-hidden rounded-[var(--identity-radius-card)] border bg-[var(--color-card)] p-1.5 transition duration-300 hover:-translate-y-1 md:p-2.5 hover:border-[var(--identity-accent-line)] ${
                                    group.status === "learning"
                                        ? "border-dashed border-[var(--identity-accent-line)]"
                                        : "border-[var(--color-line)]"
                                }`}
                            >
                                <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[var(--color-accent-ink)] lg:tracking-[0.24em]">
                                    {group.title}
                                </p>
                                <p className="mt-1 line-clamp-1 text-xs leading-5 text-[var(--color-ink-soft)] max-md:hidden lg:line-clamp-2">
                                    {group.description}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-1 md:mt-2">
                                    {group.items.map((item) => (
                                        <span
                                            key={item}
                                            className={`rounded-full border px-1.5 py-0.5 text-[0.6rem] sm:text-[0.65rem] lg:px-2 lg:py-0.5 ${
                                                group.status === "learning"
                                                    ? "border-[var(--identity-accent-line)] bg-[var(--identity-accent-quiet)] font-medium text-[var(--color-accent-ink)]"
                                                    : "border-[var(--color-line)] text-[var(--color-ink)]"
                                            }`}
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                {group.status === "learning" ? (
                                    <p className="mt-2 text-[0.66rem] font-medium uppercase tracking-[0.16em] text-[var(--color-accent-ink)] max-md:hidden">
                                        Currently learning
                                    </p>
                                ) : null}

                                {/* The linked projects: covers the card instead of
                                    floating above it, so it never gets clipped by a
                                    neighbour in the grid. Shown on hover, and taking
                                    its turn unprompted so a reader who never hovers
                                    still finds it. */}
                                {group.linkedProjects?.length ? (
                                    <div aria-hidden={activeIndex !== index} className="absolute inset-0">
                                        {/* Opaque well before the bubbles below are
                                            done animating in, and stays opaque until
                                            they are gone, so the stack's own text
                                            never shows through mid-transition. The
                                            exit is deliberately quieter than the
                                            entry: the eye should follow the card
                                            that opens, not the one that closes. */}
                                        <div
                                            className={`absolute inset-0 bg-[var(--color-card)] transition-opacity ${
                                                activeIndex === index
                                                    ? "opacity-100 duration-150"
                                                    : "opacity-0 delay-200 duration-700 ease-out"
                                            }`}
                                        />
                                        <div
                                            className={`absolute inset-0 flex flex-wrap content-center items-center justify-center gap-1 p-1.5 md:gap-1.5 md:p-2.5 ${
                                                activeIndex === index
                                                    ? "pointer-events-auto scale-100 opacity-100 transition-all duration-500 ease-out"
                                                    : "pointer-events-none scale-95 opacity-0 [transition:opacity_200ms_ease-in,scale_0s_linear_200ms]"
                                            }`}
                                        >
                                            <span className="w-full text-center font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[var(--color-text-soft)] max-md:hidden">
                                                Linked to
                                            </span>
                                            {group.linkedProjects.map((linked) => (
                                                <Link
                                                    key={linked.name}
                                                    href={linked.href}
                                                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-card-subtle)] px-2 py-0.5 transition-colors md:px-2.5 md:py-1 duration-300 hover:border-[var(--identity-accent-line)]"
                                                >
                                                    {linked.logo ? (
                                                        <Image
                                                            src={linked.logo}
                                                            alt={linked.showName ? "" : linked.name}
                                                            width={linked.logoWidth ?? 200}
                                                            height={linked.logoHeight ?? 40}
                                                            className="h-2.5 w-auto md:h-3 lg:h-3.5"
                                                        />
                                                    ) : null}
                                                    {!linked.logo || linked.showName ? (
                                                        <span className="text-[0.65rem] font-medium text-[var(--color-ink)] md:text-xs lg:text-sm">
                                                            {linked.name}
                                                        </span>
                                                    ) : null}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Below lg the desk takes whatever height the cards leave at the
                    bottom of the screen, pulled up to tuck its top edge behind
                    the last card row so the sun rays read as coming from behind
                    the stack rather than starting in empty space; desktop gives
                    it the right column, untouched. The day/night runs on its
                    own loop. */}
                {/* On desktop, where the scene sits in its own column instead
                    of bleeding behind the card stack, it gets the same
                    rounded-card frame as every other panel — with the card
                    background behind it, so the desk not quite reaching the
                    frame's own corners reads as a deliberate mount, not a
                    stray gap. */}
                <div className="pointer-events-none relative z-0 -mt-12 min-h-0 flex-1 lg:mt-0 lg:h-[62vh] lg:flex-none lg:overflow-hidden lg:rounded-[var(--identity-radius-card)] lg:border lg:border-[var(--color-line)] lg:bg-[var(--color-card)]">
                    {/* Pinned rather than h-full: on tablets the section only has
                        a min height, which a percentage height cannot resolve
                        against, and the still would size itself off the width. */}
                    <div className="absolute inset-0">
                        <SceneMount sectionRef={sectionRef} fallback={<DeskStill />} className="h-full">
                            {(capability) => <DeskScene capability={capability} />}
                        </SceneMount>
                    </div>
                </div>
            </div>
        </section>
    );
}
