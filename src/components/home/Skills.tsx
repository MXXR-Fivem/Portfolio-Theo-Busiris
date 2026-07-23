import SectionIntro from "@/components/home/SectionIntro";
import { skillGroups } from "@/data/site";

export default function Skills() {
    return (
        <section id="skills" className="section-shell">
            <div className="section-panel p-3.5 sm:p-[1.1rem] lg:p-8">
                <div className="space-y-3 lg:space-y-6">
                    <SectionIntro
                        eyebrow="Skills"
                        title="A practical stack, grouped by how I use it."
                        description=""
                        align="center"
                    />

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:gap-3">
                        {skillGroups.map((group) => (
                            <div
                                key={group.title}
                                className={`rounded-[var(--identity-radius-card)] border bg-[var(--color-card)] p-3 transition duration-300 hover:-translate-y-1 hover:border-[var(--identity-accent-line)] lg:p-4 ${
                                    group.status === "learning"
                                        ? "border-dashed border-[var(--identity-accent-line)]"
                                        : "border-[var(--color-line)]"
                                }`}
                            >
                                <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--color-accent-ink)] lg:text-xs lg:tracking-[0.28em]">
                                    {group.title}
                                </p>
                                <p className="mt-2 text-xs leading-5 text-[var(--color-ink-soft)] lg:mt-3 lg:text-sm lg:leading-6">
                                    {group.description}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1 lg:mt-4 lg:gap-2">
                                    {group.items.map((item) => (
                                        <span
                                            key={item}
                                            className={`rounded-full border px-1.5 py-0.5 text-[0.6rem] sm:text-[0.65rem] lg:px-2.5 lg:py-1.5 lg:text-xs ${
                                                group.status === "learning"
                                                    ? "border-[var(--identity-accent-line)] bg-[var(--identity-accent-quiet)] font-semibold text-[var(--color-accent-ink)]"
                                                    : "border-[var(--color-line)] bg-[var(--color-card)] text-[var(--color-ink)]"
                                            }`}
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                {group.status === "learning" ? (
                                    <p className="mt-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[var(--color-accent-ink)] lg:mt-4 lg:text-xs lg:tracking-[0.18em]">
                                        Currently learning
                                    </p>
                                ) : group.projectLink && (
                                    <p className="mt-2 text-[0.7rem] text-[var(--color-text-soft)] lg:mt-4 lg:text-xs">
                                        Linked to:{" "}
                                        <span className="text-[var(--color-ink)]">{group.projectLink}</span>
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
