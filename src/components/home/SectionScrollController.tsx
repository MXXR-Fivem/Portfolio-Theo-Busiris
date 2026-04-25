"use client";

import { useEffect, useRef } from "react";

const SCROLL_COOLDOWN_MS = 800;
const MIN_WHEEL_DELTA = 36;
const MIN_TOUCH_DELTA = 42;
const WHEEL_GESTURE_RESET_MS = 140;
const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)";
const WIDTH_RESET_THRESHOLD = 24;

function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest("input, textarea, select"));
}

function getSections() {
    return Array.from(document.querySelectorAll<HTMLElement>("main > section"));
}

function measureViewportHeight() {
    return Math.round(
        Math.max(
            window.innerHeight,
            window.visualViewport?.height ?? 0,
            document.documentElement.clientHeight
        )
    );
}

function getCurrentSectionIndex(sections: HTMLElement[]) {
    const viewportAnchor = window.scrollY + measureViewportHeight() * 0.42;

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
    const resizeSnapFrameRef = useRef<number | null>(null);
    const stableViewportHeightRef = useRef(0);
    const viewportWidthRef = useRef(0);
    const touchStartYRef = useRef<number | null>(null);
    const touchTargetIsInteractiveRef = useRef(false);

    useEffect(() => {
        const mobileViewport = window.matchMedia(MOBILE_VIEWPORT_QUERY);

        function snapToActiveSection() {
            const sections = getSections();
            const target = sections[activeIndexRef.current];

            if (!target) {
                return;
            }

            if (resizeSnapFrameRef.current !== null) {
                window.cancelAnimationFrame(resizeSnapFrameRef.current);
            }

            resizeSnapFrameRef.current = window.requestAnimationFrame(() => {
                window.scrollTo({
                    top: target.offsetTop,
                    behavior: "auto",
                });
            });
        }

        function updateSectionHeight({ preserveSection = false } = {}) {
            const measuredHeight = measureViewportHeight();
            const measuredWidth = window.innerWidth;
            const widthChanged =
                Math.abs(measuredWidth - viewportWidthRef.current) > WIDTH_RESET_THRESHOLD;

            if (!stableViewportHeightRef.current || widthChanged || !mobileViewport.matches) {
                stableViewportHeightRef.current = measuredHeight;
                viewportWidthRef.current = measuredWidth;
            } else {
                stableViewportHeightRef.current = Math.max(
                    stableViewportHeightRef.current,
                    measuredHeight
                );
            }

            document.documentElement.style.setProperty(
                "--section-height",
                `${stableViewportHeightRef.current}px`
            );

            if (preserveSection) {
                snapToActiveSection();
            }
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

        function onViewportResize() {
            updateSectionHeight({ preserveSection: true });
        }

        updateSectionHeight();
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onViewportResize);
        window.visualViewport?.addEventListener("resize", onViewportResize);
        document.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
        document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
        document.addEventListener("touchend", onTouchEnd, { capture: true });

        return () => {
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onViewportResize);
            window.visualViewport?.removeEventListener("resize", onViewportResize);
            document.removeEventListener("touchstart", onTouchStart, true);
            document.removeEventListener("touchmove", onTouchMove, true);
            document.removeEventListener("touchend", onTouchEnd, true);
            if (snapTimeoutRef.current !== null) {
                window.clearTimeout(snapTimeoutRef.current);
            }
            if (wheelResetTimeoutRef.current !== null) {
                window.clearTimeout(wheelResetTimeoutRef.current);
            }
            if (resizeSnapFrameRef.current !== null) {
                window.cancelAnimationFrame(resizeSnapFrameRef.current);
            }
        };
    }, []);

    return null;
}
