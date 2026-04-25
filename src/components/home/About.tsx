import { HiOutlineCommandLine, HiOutlineRocketLaunch } from "react-icons/hi2";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import SectionIntro from "@/components/home/SectionIntro";
import { aboutHighlights, quickFacts } from "@/data/site";

const icons = [HiOutlineCommandLine, MdOutlineDashboardCustomize, HiOutlineRocketLaunch];

export default function About() {
    return (
        <section id="about" className="section-shell snap-section">
            <div className="section-panel grid gap-3 p-3.5 sm:p-[1.1rem] md:grid-cols-[0.95fr_1.05fr] lg:grid-cols-[0.5fr_0.5fr] lg:gap-5 lg:p-10">
                <div className="space-y-3 lg:space-y-5">
                    <SectionIntro
                        eyebrow="About"
                        title="I am already building with real constraints, not waiting for permission to start."
                        description="I like useful products, sharp interfaces, dependable backend foundations and the constant loop of learning through shipping."
                    />

                    <div className="hidden gap-3 sm:grid">
                        {aboutHighlights.slice(0, 2).map((paragraph) => (
                            <p key={paragraph} className="text-sm leading-6 text-slate-300 lg:text-base lg:leading-7">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 md:grid-cols-1 lg:gap-4">
                    {quickFacts.map((fact, index) => {
                        const Icon = icons[index];

                        return (
                            <div
                                key={fact.title}
                                className="grid-outline rounded-[var(--identity-radius-card)] p-3 transition duration-300 hover:-translate-y-1 hover:border-[var(--identity-border-strong)] lg:p-4"
                            >
                                <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-base text-cyan-300 lg:mb-3 lg:h-10 lg:w-10 lg:rounded-2xl lg:text-lg">
                                    <Icon />
                                </div>
                                <h3 className="text-xs font-semibold text-white sm:text-sm lg:text-lg">{fact.title}</h3>
                                <p className="mt-1 hidden text-xs leading-5 text-slate-300 sm:block lg:mt-2 lg:text-sm lg:leading-6">
                                    {fact.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-2 md:col-span-2 md:grid-cols-3 lg:gap-4">
                    {aboutHighlights.slice(2).map((paragraph) => (
                        <div
                            key={paragraph}
                            className="hidden rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3.5 sm:block lg:p-5"
                        >
                            <p className="text-xs leading-5 text-slate-300 lg:text-base lg:leading-6">{paragraph}</p>
                        </div>
                    ))}
                    <div className="rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--identity-accent-quiet)] p-3.5 lg:p-5">
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-cyan-200 lg:text-xs lg:tracking-[0.24em]">
                            Current direction
                        </p>
                        <p className="mt-1.5 text-xs leading-5 text-slate-200 lg:mt-3 lg:text-base lg:leading-6">
                            Fullstack projects with cleaner architecture, stronger mobile flows and backend choices that can support real users.
                        </p>
                    </div>
                    <div className="rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3.5 lg:p-5">
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-lime-200 lg:text-xs lg:tracking-[0.24em]">
                            Working style
                        </p>
                        <p className="mt-1.5 text-xs leading-5 text-slate-200 lg:mt-3 lg:text-base lg:leading-6">
                            Build, test with constraints, listen to feedback, then iterate on the parts that actually move the product forward.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
