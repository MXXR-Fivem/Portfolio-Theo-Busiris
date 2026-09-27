import { HiOutlineCommandLine, HiOutlineRocketLaunch } from "react-icons/hi2";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import SectionIntro from "@/components/home/SectionIntro";
import AboutCats from "@/components/home/AboutCats";
import { aboutHighlights, quickFacts } from "@/data/site";

const icons = [HiOutlineCommandLine, MdOutlineDashboardCustomize, HiOutlineRocketLaunch];

export default function About() {
    return (
        <section id="about" className="section-shell">
            {/* Desktop gets its own pass below: the boxed panel, with a grid of
                small cards inside another grid, was reading as cluttered at
                that width. Below lg this original layout is untouched. */}
            <div className="section-panel grid gap-3 p-3.5 sm:p-[1.1rem] md:grid-cols-[0.95fr_1.05fr] lg:hidden">
                <div className="space-y-3 lg:space-y-4">
                    <SectionIntro
                        eyebrow="About"
                        title="I am already building under real constraints."
                        description="Useful products, sharp interfaces, backends that hold. Learning by shipping."
                    />

                    <div className="grid gap-3">
                        {aboutHighlights.slice(0, 2).map((paragraph) => (
                            <p key={paragraph} className="text-sm leading-6 text-[var(--color-ink-soft)] lg:text-base lg:leading-7">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Tablet stacks these three in the narrow right column; desktop's
                    column is wide enough to take them back into one row, which
                    is what keeps the panel from towering over the left column
                    and crowding the navbar. */}
                <div className="grid grid-cols-3 gap-2 md:grid-cols-1 lg:grid-cols-3 lg:gap-4">
                    {quickFacts.map((fact, index) => {
                        const Icon = icons[index];

                        return (
                            <div
                                key={fact.title}
                                className="grid-outline rounded-[var(--identity-radius-card)] p-2.5 transition md:p-3 duration-300 hover:-translate-y-1 hover:border-[var(--identity-border-strong)] lg:p-4"
                            >
                                <div className="mb-1.5 inline-flex h-7 w-7 md:mb-2 md:h-8 md:w-8 items-center justify-center rounded-xl bg-[var(--color-card)] text-base text-[var(--color-accent-ink)] lg:mb-3 lg:h-10 lg:w-10 lg:rounded-2xl lg:text-lg">
                                    <Icon />
                                </div>
                                <h3 className="text-xs font-semibold text-[var(--color-ink)] sm:text-sm lg:text-lg">{fact.title}</h3>
                                <p className="mt-1 hidden text-xs leading-5 text-[var(--color-ink-soft)] md:block lg:mt-2 lg:text-sm lg:leading-6">
                                    {fact.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-2 md:col-span-2 md:grid-cols-3 lg:gap-3">
                    {/* Phones keep only the current direction: the rest pushed
                        the cats off the bottom of the screen. */}
                    {aboutHighlights.slice(2).map((paragraph) => (
                        <div
                            key={paragraph}
                            className="hidden rounded-[var(--identity-radius-card)] border md:block border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3.5 lg:p-4"
                        >
                            <p className="text-xs leading-5 text-[var(--color-ink-soft)] lg:text-sm lg:leading-6">{paragraph}</p>
                        </div>
                    ))}
                    <div className="rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--identity-accent-quiet)] p-3.5 lg:p-4">
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-accent-ink)] lg:text-xs lg:tracking-[0.24em]">
                            Current direction
                        </p>
                        <p className="mt-1.5 text-xs leading-5 text-[var(--color-ink)] lg:mt-2 lg:text-sm lg:leading-6">
                            Scaling Vibaura: cleaner architecture, stronger mobile flows, backend choices that carry real users.
                        </p>
                    </div>
                    <div className="hidden rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3.5 md:block lg:p-4">
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-accent-ink)] lg:text-xs lg:tracking-[0.24em]">
                            Working style
                        </p>
                        <p className="mt-1.5 text-xs leading-5 text-[var(--color-ink)] lg:mt-2 lg:text-sm lg:leading-6">
                            Build, test, listen, then iterate on what actually moves the product.
                        </p>
                    </div>
                </div>
            </div>

            {/* Desktop: open and editorial rather than boxed, matching the Hero
                above it. One short introduction, a plain divided list for the
                facts instead of a grid of cards, and the current focus folded
                into a single line instead of its own tile. */}
            <div className="hidden lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
                <div className="space-y-6">
                    <SectionIntro
                        eyebrow="About"
                        title="I am already building under real constraints."
                        description="Useful products, sharp interfaces, backends that hold. Learning by shipping."
                    />

                    <div className="max-w-xl space-y-4 text-base leading-7 text-[var(--color-ink-soft)]">
                        {aboutHighlights.slice(0, 2).map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>

                    <p className="max-w-xl text-sm leading-6 text-[var(--color-ink)]">
                        <span className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-accent-ink)]">
                            Now —{" "}
                        </span>
                        Scaling Vibaura: cleaner architecture, stronger mobile flows, backend choices that carry real users.
                    </p>
                </div>

                <div className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
                    {quickFacts.map((fact, index) => {
                        const Icon = icons[index];

                        return (
                            <div key={fact.title} className="flex items-start gap-4 py-5 first:pt-0">
                                <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-card-subtle)] text-base text-[var(--color-accent-ink)]">
                                    <Icon />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-[var(--color-ink)]">{fact.title}</h3>
                                    <p className="mt-1 text-sm leading-6 text-[var(--color-ink-soft)]">{fact.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <AboutCats />
        </section>
    );
}
