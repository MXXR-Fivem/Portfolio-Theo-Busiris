import SectionIntro from "@/components/home/SectionIntro";
import { ambitions } from "@/data/site";

export default function Ambitions() {
    return (
        <section className="section-shell snap-section">
            <div className="section-panel p-3.5 sm:p-[1.1rem] lg:p-12">
                <div className="space-y-3 lg:space-y-10">
                    <SectionIntro
                        eyebrow="Ambitions"
                        title="What I want to keep building next."
                        description="I am aiming for stronger backend architecture, better mobile products, cleaner cloud deployment habits and practical AI used in useful products."
                        align="center"
                    />

                    <div className="grid gap-2 md:grid-cols-3 lg:gap-4">
                        {ambitions.map((item, index) => (
                            <div
                                key={item.title}
                                className="relative overflow-hidden rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3.5 lg:p-6"
                            >
                                <div className={`absolute inset-x-0 top-0 h-1 ${index === 0 ? "bg-[var(--identity-accent-primary)]" : index === 1 ? "bg-[var(--identity-accent-sport)]" : "bg-[var(--identity-accent-secondary)]"}`} />
                                <h3 className="text-base font-semibold text-white lg:text-2xl">{item.title}</h3>
                                <p className="mt-1.5 text-xs leading-5 text-slate-300 sm:text-sm lg:mt-4 lg:text-base lg:leading-7">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
