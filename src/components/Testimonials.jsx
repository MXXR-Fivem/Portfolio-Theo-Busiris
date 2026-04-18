"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Testimonials.module.css";
import { AiOutlineComment } from "react-icons/ai";

const FALLBACK_TESTIMONIALS = [
    {
        id: "fallback-1",
        text: `A very good script that works very well and is configurable to our liking.
Very responsive support that knows how to help you. I highly recommend you!`,
        author: "MXXR shop",
        link: "https://mxxr.tebex.io",
    },
    {
        id: "fallback-2",
        text: `I have no complaints about the developer or the scripts, he is very attentive to problems and tries to resolve them quickly!
Very quick response to all our questions, I recommend!`,
        author: "MXXR shop",
        link: "https://mxxr.tebex.io",
    },
    {
        id: "fallback-3",
        text: `Nothing to say!
Quality scripts, responsive and competent support.
Got a question? He'll answer you as quickly as possible and very kindly!`,
        author: "MXXR shop",
        link: "https://mxxr.tebex.io",
    },
];

const ROTATION_DELAY_MS = 7000;
const TRANSITION_DURATION_MS = 900;

function pickString(...values) {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return "";
}

function normalizeReview(review, index = 0) {
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

    const source = pickString(
        review.link,
        review.url,
        review.sourceUrl,
        review.profileUrl,
        review.website,
        review.user?.url,
        review.author?.url
    ) ||
        "https://mxxr.tebex.io";

    const id =
        review.id ||
        review._id ||
        review.uuid ||
        `${author}-${String(text).slice(0, 32)}-${index}`;

    return {
        id: String(id),
        text: String(text).trim(),
        author: String(author).trim(),
        link: String(source),
    };
}

function collectReviewCandidates(value, depth = 0) {
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

function extractReviews(payload) {
    if (Array.isArray(payload?.reviews)) {
        return payload.reviews
            .map((review, index) => normalizeReview(review, index))
            .filter(Boolean)
            .slice(0, 3);
    }

    const buckets = [
        payload,
        payload?.reviews,
        payload?.data,
        payload?.items,
        payload?.results,
        payload?.review,
    ];
    const candidates = buckets.flatMap((value) => collectReviewCandidates(value));

    return candidates
        .map((review, index) => normalizeReview(review, index))
        .filter(Boolean)
        .slice(0, 3);
}

async function fetchRandomReviews(signal) {
    const response = await fetch("/api/reviews/random?limit=3", {
        method: "GET",
        cache: "no-store",
        signal,
    });

    if (!response.ok) {
        throw new Error(`Reviews HTTP error: ${response.status}`);
    }

    const payload = await response.json();
    const reviews = extractReviews(payload);

    if (!reviews.length) {
        return null;
    }

    return reviews;
}

function TestimonialCard({ text, link, style }) {
    return (
        <div className={styles.testimonial} style={style}>
            <p className={styles.text}>&quot;{text}&quot;</p>
            <div className={styles.user}>
                <AiOutlineComment className={styles.userIcon} />
                <h4 className={styles.userName}>
                    - On{" "}
                    <a target="_blank" rel="noreferrer" href={link}>
                        MXXR shop
                    </a>
                </h4>
            </div>
        </div>
    );
}

function ReviewTrack({ reviews, animationClass }) {
    return (
        <div className={`${styles.track} ${animationClass || ""}`}>
            {reviews.map((testimonial, index) => (
                <TestimonialCard
                    key={testimonial.id}
                    text={testimonial.text}
                    link={testimonial.link}
                    style={{ animationDelay: `${index * 90}ms` }}
                />
            ))}
        </div>
    );
}

export default function Testimonials() {
    const [reviews, setReviews] = useState(FALLBACK_TESTIMONIALS);
    const [incomingReviews, setIncomingReviews] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const isMountedRef = useRef(false);
    const isFetchingRef = useRef(false);
    const isTransitioningRef = useRef(false);
    const transitionTimeoutRef = useRef(null);

    useEffect(() => {
        isTransitioningRef.current = isTransitioning;
    }, [isTransitioning]);

    useEffect(() => {
        isMountedRef.current = true;
        const controller = new AbortController();

        (async () => {
            try {
                const initialReviews = await fetchRandomReviews(controller.signal);

                if (isMountedRef.current && initialReviews?.length) {
                    setReviews(initialReviews);
                }
            } catch (error) {
                if (isMountedRef.current) {
                    setReviews(FALLBACK_TESTIMONIALS);
                }

                console.error("Unable to load initial reviews", error);
            }
        })();

        return () => {
            isMountedRef.current = false;
            controller.abort();

            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (isFetchingRef.current || isTransitioningRef.current) {
                return;
            }

            isFetchingRef.current = true;

            try {
                const nextReviews = await fetchRandomReviews();

                if (!isMountedRef.current || !nextReviews?.length) {
                    return;
                }

                setIncomingReviews(nextReviews);
                setIsTransitioning(true);

                if (transitionTimeoutRef.current) {
                    clearTimeout(transitionTimeoutRef.current);
                }

                transitionTimeoutRef.current = setTimeout(() => {
                    if (!isMountedRef.current) {
                        return;
                    }

                    setReviews(nextReviews);
                    setIncomingReviews(null);
                    setIsTransitioning(false);
                }, TRANSITION_DURATION_MS);
            } catch (error) {
                if (error?.name !== "AbortError") {
                    console.error("Unable to rotate reviews", error);
                }
            } finally {
                isFetchingRef.current = false;
            }
        }, ROTATION_DELAY_MS);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className={styles.body}>
            <h2 className={styles.title}>Customer Testimonials</h2>

            <div className={styles.viewport}>
                {reviews.length > 0 && (
                    <ReviewTrack
                        reviews={reviews}
                        animationClass={isTransitioning ? styles.exitTrack : ""}
                    />
                )}

                {incomingReviews && (
                    <ReviewTrack
                        reviews={incomingReviews}
                        animationClass={styles.enterTrack}
                    />
                )}
            </div>
        </div>
    );
}
