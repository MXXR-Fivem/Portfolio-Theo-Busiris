"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import SectionIntro from "@/components/home/SectionIntro";
import SceneMount from "@/components/three/SceneMount";
import DeskStill from "@/components/three/skills/DeskStill";
import { skillGroups } from "@/data/site";

const DeskScene = dynamic(() => import("@/components/three/skills/DeskScene"), {
    ssr: false,
});

export default function Skills() {
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <section ref={sectionRef} id="skills" className="section-shell relative">
            <div className="grid w-full items-center gap-6 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10">
                <div className="space-y-4 lg:space-y-5">
                    <SectionIntro
                        eyebrow="Skills"
                        title="A practical stack, grouped by how I use it."
                        description=""
                        size="compact"
                    />

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-2 lg:gap-2.5">
                        {skillGroups.map((group) => (
                            <div
                                key={group.title}
                                className={`rounded-[var(--identity-radius-card)] border bg-[var(--color-card)] p-2.5 transition duration-300 hover:-translate-y-1 hover:border-[var(--identity-accent-line)] ${
                                    group.status === "learning"
                                        ? "border-dashed border-[var(--identity-accent-line)]"
                                        : "border-[var(--color-line)]"
                                }`}
                            >
                                <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[var(--color-accent-ink)] lg:tracking-[0.24em]">
                                    {group.title}
                                </p>
                                <p className="mt-1 line-clamp-1 text-xs leading-5 text-[var(--color-ink-soft)] lg:line-clamp-2">
                                    {group.description}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1">
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
                                    <p className="mt-2 text-[0.66rem] font-medium uppercase tracking-[0.16em] text-[var(--color-accent-ink)]">
                                        Currently learning
                                    </p>
                                ) : group.projectLink && (
                                    <p className="mt-2 hidden text-[0.68rem] text-[var(--color-text-soft)] lg:block">
                                        Linked to:{" "}
                                        <span className="text-[var(--color-ink)]">{group.projectLink}</span>
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile keeps the desk faint behind the cards; desktop gives it
                    the right column. The day/night runs on its own loop. */}
                <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.16] lg:relative lg:inset-auto lg:z-auto lg:h-[62vh] lg:opacity-100">
                    <SceneMount sectionRef={sectionRef} fallback={<DeskStill />} className="h-full">
                        {(capability) => <DeskScene capability={capability} />}
                    </SceneMount>
                </div>
            </div>
        </section>
    );
}
