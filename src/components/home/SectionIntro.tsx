type SectionIntroProps = {
    eyebrow: string;
    title: string;
    description: string;
    align?: "left" | "center";
};

export default function SectionIntro({
    eyebrow,
    title,
    description,
    align = "left",
}: SectionIntroProps) {
    const alignment =
        align === "center"
            ? "mx-auto max-w-4xl text-center items-center"
            : "max-w-3xl";

    return (
        <div className={`flex flex-col gap-2 lg:gap-5 ${alignment}`}>
            <span className="section-label">{eyebrow}</span>
            <div className="space-y-1.5 sm:space-y-2 lg:space-y-4">
                <h2 className="text-balance text-xl font-semibold text-white sm:text-2xl md:text-3xl lg:text-5xl">
                    {title}
                </h2>
                <p className="body-copy hidden sm:block">{description}</p>
            </div>
        </div>
    );
}
