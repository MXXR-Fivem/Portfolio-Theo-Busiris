type SectionIntroProps = {
    eyebrow: string;
    title: string;
    description: string;
    align?: "left" | "center";
    /** "compact" is for half-width columns, where the display size overflows. */
    size?: "default" | "compact";
};

export default function SectionIntro({
    eyebrow,
    title,
    description,
    align = "left",
    size = "default",
}: SectionIntroProps) {
    const alignment =
        align === "center"
            ? "mx-auto max-w-4xl items-center text-center"
            // Without items-start the eyebrow pill stretches to the column width.
            : "max-w-3xl items-start";

    return (
        <div className={`flex flex-col gap-2 lg:gap-5 ${alignment}`}>
            <span className="section-label">{eyebrow}</span>
            <div className="space-y-1.5 sm:space-y-2 lg:space-y-4">
                <h2
                    className={`text-balance text-xl font-semibold text-[var(--color-ink)] sm:text-2xl md:text-3xl ${
                        size === "compact" ? "lg:text-4xl" : "lg:text-5xl"
                    }`}
                >
                    {title}
                </h2>
                <p className="body-copy">{description}</p>
            </div>
        </div>
    );
}
