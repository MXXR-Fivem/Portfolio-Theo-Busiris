"use client";

import { useEffect, useRef } from "react";

const SCROLL_COOLDOWN_MS = 800;
const MIN_WHEEL_DELTA = 36;
const MIN_TOUCH_DELTA = 42;
const WHEEL_GESTURE_RESET_MS = 140;

function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest("input, textarea, select"));
}

function getSections() {
    return Array.from(document.querySelectorAll<HTMLElement>("main > section"));
}

function getViewportHeight() {
    return window.visualViewport?.height ?? window.innerHeight;
}

function getCurrentSectionIndex(sections: HTMLElement[]) {
    const viewportAnchor = window.scrollY + getViewportHeight() * 0.42;

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
        const distance = Math.abs(section.offsetTop - viewportAnchor);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    return closestIndex;
}

export default function SectionScrollController() {
    const lockedUntilRef = useRef(0);
    const activeIndexRef = useRef(0);
    const isAnimatingRef = useRef(false);
    const snapTimeoutRef = useRef<number | null>(null);
    const wheelDeltaRef = useRef(0);
    const wheelResetTimeoutRef = useRef<number | null>(null);
    const touchStartYRef = useRef<number | null>(null);
    const touchTargetIsInteractiveRef = useRef(false);

    useEffect(() => {
        function updateSectionHeight() {
            document.documentElement.style.setProperty(
                "--section-height",
                `${Math.round(getViewportHeight())}px`
            );
        }

        function scrollToSection(index: number) {
            const sections = getSections();
            const safeIndex = Math.min(Math.max(index, 0), sections.length - 1);
            const target = sections[safeIndex];

            if (!target) {
                return;
            }

            activeIndexRef.current = safeIndex;
            isAnimatingRef.current = true;
            window.scrollTo({
                top: target.offsetTop,
                behavior: "smooth",
            });

            if (snapTimeoutRef.current !== null) {
                window.clearTimeout(snapTimeoutRef.current);
            }

            snapTimeoutRef.current = window.setTimeout(() => {
                window.scrollTo({
                    top: target.offsetTop,
                    behavior: "auto",
                });
                isAnimatingRef.current = false;
            }, SCROLL_COOLDOWN_MS);
        }

        function goToSection(direction: 1 | -1) {
            const sections = getSections();

            if (!sections.length) {
                return;
            }

            const currentIndex = getCurrentSectionIndex(sections);
            activeIndexRef.current = currentIndex;
            const nextIndex = Math.min(
                Math.max(currentIndex + direction, 0),
                sections.length - 1
            );

            scrollToSection(nextIndex);
        }

        function onWheel(event: WheelEvent) {
            if (isInteractiveTarget(event.target)) {
                return;
            }

            const now = Date.now();

            event.preventDefault();

            if (now < lockedUntilRef.current) {
                return;
            }

            wheelDeltaRef.current += event.deltaY;

            if (wheelResetTimeoutRef.current !== null) {
                window.clearTimeout(wheelResetTimeoutRef.current);
            }

            wheelResetTimeoutRef.current = window.setTimeout(() => {
                wheelDeltaRef.current = 0;
            }, WHEEL_GESTURE_RESET_MS);

            if (Math.abs(wheelDeltaRef.current) < MIN_WHEEL_DELTA) {
                return;
            }

            const direction = wheelDeltaRef.current > 0 ? 1 : -1;
            wheelDeltaRef.current = 0;
            lockedUntilRef.current = now + SCROLL_COOLDOWN_MS;
            goToSection(direction);
        }

        function onKeyDown(event: KeyboardEvent) {
            const nextKeys = ["ArrowDown", "PageDown", " "];
            const prevKeys = ["ArrowUp", "PageUp"];

            if (![...nextKeys, ...prevKeys].includes(event.key)) {
                return;
            }

            event.preventDefault();

            const now = Date.now();

            if (now < lockedUntilRef.current) {
                return;
            }

            lockedUntilRef.current = now + SCROLL_COOLDOWN_MS;
            goToSection(nextKeys.includes(event.key) ? 1 : -1);
        }

        function onTouchStart(event: TouchEvent) {
            if (event.touches.length !== 1) {
                touchStartYRef.current = null;
                return;
            }

            touchTargetIsInteractiveRef.current = isInteractiveTarget(event.target);
            touchStartYRef.current = event.touches[0].clientY;
        }

        function onTouchMove(event: TouchEvent) {
            if (
                touchTargetIsInteractiveRef.current ||
                touchStartYRef.current === null ||
                event.touches.length !== 1
            ) {
                return;
            }

            event.preventDefault();
        }

        function onTouchEnd(event: TouchEvent) {
            if (
                touchTargetIsInteractiveRef.current ||
                touchStartYRef.current === null ||
                event.changedTouches.length !== 1
            ) {
                touchStartYRef.current = null;
                return;
            }

            const deltaY = touchStartYRef.current - event.changedTouches[0].clientY;
            touchStartYRef.current = null;

            if (Math.abs(deltaY) < MIN_TOUCH_DELTA) {
                return;
            }

            const now = Date.now();

            if (now < lockedUntilRef.current) {
                return;
            }

            lockedUntilRef.current = now + SCROLL_COOLDOWN_MS;
            goToSection(deltaY > 0 ? 1 : -1);
        }

        function onScroll() {
            const sections = getSections();

            if (!sections.length) {
                return;
            }

            if (isAnimatingRef.current) {
                return;
            }

            activeIndexRef.current = getCurrentSectionIndex(sections);
        }

        updateSectionHeight();
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", updateSectionHeight);
        window.visualViewport?.addEventListener("resize", updateSectionHeight);
        document.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
        document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
        document.addEventListener("touchend", onTouchEnd, { capture: true });

        return () => {
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", updateSectionHeight);
            window.visualViewport?.removeEventListener("resize", updateSectionHeight);
            document.removeEventListener("touchstart", onTouchStart, true);
            document.removeEventListener("touchmove", onTouchMove, true);
            document.removeEventListener("touchend", onTouchEnd, true);
            if (snapTimeoutRef.current !== null) {
                window.clearTimeout(snapTimeoutRef.current);
            }
            if (wheelResetTimeoutRef.current !== null) {
                window.clearTimeout(wheelResetTimeoutRef.current);
            }
        };
    }, []);

    return null;
}
