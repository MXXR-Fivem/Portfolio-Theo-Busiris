"use client";

import { useEffect, useState } from "react";
import { FaQuoteLeft, FaStar } from "react-icons/fa6";
import SectionIntro from "@/components/home/SectionIntro";

type Review = {
    id: string;
    text: string;
    author: string;
    link: string;
};

const FALLBACK_TESTIMONIALS: Review[] = [
    {
        id: "fallback-1",
        text: "A very good script that works very well and is configurable to our liking. Very responsive support that knows how to help you.",
        author: "MXXR shop customer",
        link: "https://mxxr.tebex.io",
    },
    {
        id: "fallback-2",
        text: "He is very attentive to problems and tries to resolve them quickly. Very quick response to all our questions.",
        author: "MXXR shop customer",
        link: "https://mxxr.tebex.io",
    },
    {
        id: "fallback-3",
        text: "Quality scripts, responsive and competent support. Got a question? He answers quickly and kindly.",
        author: "MXXR shop customer",
        link: "https://mxxr.tebex.io",
    },
];

function truncateReviewText(text: string) {
    return text.length > 250 ? `${text.slice(0, 250).trimEnd()}...` : text;
}

function pickString(...values: unknown[]) {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return "";
}

function normalizeReview(review: any, index = 0): Review | null {
    if (!review || typeof review !== "object") {
        return null;
    }

    const text = pickString(
        review.comment_en,
        review.comment_fr,
        review.text,
        review.comment,
        review.content,
        review.message,
        review.review,
        review.reviewText,
        review.body
    );
    const author = pickString(
        review.author_name,
        review.author,
        review.authorName,
        review.username,
        review.name,
        review.user?.name,
        review.user?.username,
        review.author?.name
    );

    if (!text || !author) {
        return null;
    }

    return {
        id: String(
            review.id || review._id || review.uuid || `${author}-${text.slice(0, 30)}-${index}`
        ),
        text,
        author,
        link:
            pickString(
                review.link,
                review.url,
                review.sourceUrl,
                review.profileUrl,
                review.website,
                review.user?.url,
                review.author?.url
            ) || "https://mxxr.tebex.io",
    };
}

function collectReviewCandidates(value: any, depth = 0): any[] {
    if (!value || depth > 3) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.flatMap((item) => collectReviewCandidates(item, depth + 1));
    }

    if (typeof value !== "object") {
        return [];
    }

    if (normalizeReview(value)) {
        return [value];
    }

    return Object.values(value).flatMap((item) =>
        collectReviewCandidates(item, depth + 1)
    );
}

function extractReviews(payload: any): Review[] {
    if (Array.isArray(payload?.reviews)) {
        return payload.reviews
            .map((review: any, index: number) => normalizeReview(review, index))
            .filter(Boolean)
            .slice(0, 3) as Review[];
    }

    return [payload, payload?.reviews, payload?.data, payload?.items, payload?.results]
        .flatMap((value) => collectReviewCandidates(value))
        .map((review, index) => normalizeReview(review, index))
        .filter(Boolean)
        .slice(0, 3) as Review[];
}

export default function Testimonials() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDeckFading, setIsDeckFading] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadReviews(initial = false) {
            try {
                if (initial) {
                    setLoading(true);
                } else {
                    setIsDeckFading(true);
                }

                const response = await fetch("/api/reviews/random?limit=3", {
                    method: "GET",
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("Unable to fetch reviews");
                }

                const payload = await response.json();
                const nextReviews = extractReviews(payload);

                if (!active) {
                    return;
                }

                setReviews(nextReviews.length ? nextReviews : FALLBACK_TESTIMONIALS);
                setActiveIndex(0);
                setError(false);
            } catch {
                if (!active) {
                    return;
                }

                setReviews(FALLBACK_TESTIMONIALS);
                setActiveIndex(0);
                setError(true);
            } finally {
                if (active) {
                    setLoading(false);
                    window.setTimeout(() => {
                        if (active) {
                            setIsDeckFading(false);
                        }
                    }, 120);
                }
            }
        }

        loadReviews(true);
        const intervalId = setInterval(() => loadReviews(false), 12000);

        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (reviews.length <= 1) {
            return;
        }

        const intervalId = setInterval(() => {
            setActiveIndex((current) => (current + 1) % reviews.length);
        }, 3200);

        return () => clearInterval(intervalId);
    }, [reviews]);

    return (
        <section id="reviews" className="section-shell snap-section">
            <div className="section-panel p-3.5 sm:p-[1.1rem] lg:p-12">
                <div className="space-y-3 lg:space-y-10">
                    <SectionIntro
                        eyebrow="Reviews"
                        title="Automatic customer feedback, redesigned to feel more credible and polished."
                        description=""
                        align="center"
                    />

                    <div className="hidden flex-wrap items-center justify-center gap-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-slate-400 sm:flex lg:gap-3 lg:text-xs lg:tracking-[0.24em]">
                        <span className="rounded-full border border-white/10 px-2.5 py-1.5 lg:px-3 lg:py-2">
                            {loading ? "Loading reviews" : "Live review integration"}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1.5 lg:px-3 lg:py-2">
                            {error ? "Fallback content displayed" : "Automatic rotation"}
                        </span>
                    </div>

                    <div className="grid gap-2 md:grid-cols-3 lg:gap-4">
                        {loading
                            ? Array.from({ length: 3 }).map((_, index) => (
                                <article
                                    key={`skeleton-${index}`}
                                    className="animate-pulse rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-4 transition duration-300 lg:p-6"
                                >
                                    <div className="space-y-4">
                                        <div className="h-5 w-10 rounded-full bg-white/10" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-full rounded bg-white/10" />
                                            <div className="h-4 w-11/12 rounded bg-white/10" />
                                            <div className="h-4 w-9/12 rounded bg-white/10" />
                                        </div>
                                        <div className="h-4 w-32 rounded bg-white/10" />
                                    </div>
                                </article>
                              ))
                            : reviews.map((review, index) => {
                                const isActive = index === activeIndex;

                                return (
                                <article
                                    key={review.id}
                                    className={`relative overflow-hidden rounded-[var(--identity-radius-card)] border bg-[var(--color-card-subtle)] p-3 transition-[transform,opacity,border-color,box-shadow] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform sm:p-3.5 lg:p-6 ${
                                        isDeckFading
                                            ? "translate-y-2 opacity-[0.35]"
                                            : isActive
                                              ? "translate-y-0 scale-[1.008] border-cyan-300/30 opacity-100 shadow-[0_18px_50px_rgba(56,189,248,0.12)]"
                                              : "translate-y-1 scale-[0.992] border-white/10 opacity-[0.66]"
                                    }`}
                                >
                                    <div
                                        className={`pointer-events-none absolute inset-0 bg-[var(--identity-accent-quiet)] transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                            isActive ? "opacity-100" : "opacity-0"
                                        }`}
                                    />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between">
                                            <FaQuoteLeft className="text-sm text-cyan-300 lg:text-xl" />
                                            <div className="flex items-center gap-1 text-amber-300">
                                                {Array.from({ length: 5 }).map((_, starIndex) => (
                                                    <FaStar key={starIndex} className="text-[0.58rem] sm:text-[0.65rem] lg:text-xs" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="review-copy mt-2 text-[0.68rem] leading-4 text-slate-200 sm:mt-3 sm:text-xs sm:leading-5 lg:mt-6 lg:text-base lg:leading-7">
                                            {truncateReviewText(review.text)}
                                        </p>
                                        <div className="mt-2 border-t border-white/10 pt-2 lg:mt-8 lg:pt-4">
                                            <p className="text-[0.68rem] font-medium text-white sm:text-xs lg:text-sm">
                                                {review.author}
                                            </p>
                                            <a
                                                href={review.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-0.5 inline-flex text-[0.68rem] text-slate-400 transition hover:text-cyan-200 sm:text-xs lg:mt-1 lg:text-sm"
                                            >
                                                View source
                                            </a>
                                        </div>
                                    </div>
                                </article>
                                );
                              })}
                    </div>
                </div>
            </div>
        </section>
    );
}
