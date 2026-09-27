"use client";

import { useEffect, useRef } from "react";

/**
 * The cooldown has to outlast the glide, or the backstop below fires into a
 * running animation. It should not outlast it by much either: every extra
 * millisecond here is a scroll the reader made and the page ignored.
 */
const SCROLL_COOLDOWN_MS = 760;
const SCROLL_ANIMATION_MS = 720;
const MIN_WHEEL_DELTA = 36;
const MIN_TOUCH_DELTA = 42;
const WHEEL_GESTURE_RESET_MS = 140;
const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)";
const WIDTH_RESET_THRESHOLD = 24;
const LINE_DELTA_PX = 16;

function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest("input, textarea, select"));
}

/**
 * True only for a field that has its own overflow to scroll, in the direction
 * being scrolled.
 *
 * The wheel handler used to hand every form field a free pass, which meant that
 * anywhere over the contact form (and its tall message box is most of that
 * section) the page fell back to native scrolling and flew past several
 * sections at once. A field that cannot scroll has nothing to hand it.
 */
function canScrollItself(target: EventTarget | null, deltaY: number) {
    if (!(target instanceof Element)) {
        return false;
    }

    const field = target.closest("textarea");

    if (!field) {
        return false;
    }

    const overflow = field.scrollHeight - field.clientHeight;

    if (overflow <= 1) {
        return false;
    }

    return deltaY > 0 ? field.scrollTop < overflow - 1 : field.scrollTop > 1;
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

/**
 * The visible height right now, with no padding toward whichever source reads
 * largest. `clientHeight` in particular can report the layout viewport behind
 * a currently-expanded address bar, not what is actually on screen; a fresh
 * baseline built from that reads as taller than the page really is, and
 * mobile Safari never gets the chance to correct it back down (the ratchet
 * below only grows).
 */
function measureCurrentViewportHeight() {
    return Math.round(window.visualViewport?.height ?? window.innerHeight);
}

function normalizeWheelDelta(event: WheelEvent) {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        return event.deltaY * LINE_DELTA_PX;
    }

    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        return event.deltaY * measureViewportHeight();
    }

    return event.deltaY;
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

/**
 * A quartic rather than a cubic: same shape, but it holds its speed longer
 * through the middle and sheds it far more gently at the end, so the section
 * arrives instead of stopping. The two halves are matched on purpose; a curve
 * whose speed steps at the midpoint reads as a bump however smooth each half is.
 */
function easeInOutQuart(progress: number) {
    return progress < 0.5
        ? 8 * progress * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 4) / 2;
}

export default function SectionScrollController() {
    const lockedUntilRef = useRef(0);
    const activeIndexRef = useRef(0);
    const isAnimatingRef = useRef(false);
    const snapTimeoutRef = useRef<number | null>(null);
    const scrollAnimationFrameRef = useRef<number | null>(null);
    const wheelDeltaRef = useRef(0);
    const wheelResetTimeoutRef = useRef<number | null>(null);
    const resizeSnapFrameRef = useRef<number | null>(null);
    const stableViewportHeightRef = useRef(0);
    const viewportWidthRef = useRef(0);
    const touchStartYRef = useRef<number | null>(null);
    const touchTargetIsInteractiveRef = useRef(false);

    useEffect(() => {
        const mobileViewport = window.matchMedia(MOBILE_VIEWPORT_QUERY);
        document.documentElement.classList.add("section-scroll-controlled");

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
                // A fresh baseline: the address bar's current state (often
                // still expanded, right after a load or an orientation
                // change) is real, so start from what is actually visible
                // rather than from the padded, always-grows reading below.
                stableViewportHeightRef.current = mobileViewport.matches
                    ? measureCurrentViewportHeight()
                    : measuredHeight;
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
            const startY = window.scrollY;
            const targetY = target.offsetTop;
            const distance = targetY - startY;
            const startedAt = performance.now();

            if (scrollAnimationFrameRef.current !== null) {
                window.cancelAnimationFrame(scrollAnimationFrameRef.current);
            }

            if (snapTimeoutRef.current !== null) {
                window.clearTimeout(snapTimeoutRef.current);
            }

            function animateScroll(now: number) {
                const progress = Math.min((now - startedAt) / SCROLL_ANIMATION_MS, 1);
                const easedProgress = easeInOutQuart(progress);

                window.scrollTo({
                    top: startY + distance * easedProgress,
                    behavior: "auto",
                });

                if (progress < 1) {
                    scrollAnimationFrameRef.current = window.requestAnimationFrame(animateScroll);
                    return;
                }

                window.scrollTo({
                    top: targetY,
                    behavior: "auto",
                });
                scrollAnimationFrameRef.current = null;
                isAnimatingRef.current = false;
                if (snapTimeoutRef.current !== null) {
                    window.clearTimeout(snapTimeoutRef.current);
                    snapTimeoutRef.current = null;
                }
            }

            scrollAnimationFrameRef.current = window.requestAnimationFrame(animateScroll);
            snapTimeoutRef.current = window.setTimeout(() => {
                if (scrollAnimationFrameRef.current !== null) {
                    window.cancelAnimationFrame(scrollAnimationFrameRef.current);
                    scrollAnimationFrameRef.current = null;
                }

                window.scrollTo({
                    top: targetY,
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
            if (canScrollItself(event.target, event.deltaY)) {
                return;
            }

            const now = Date.now();

            event.preventDefault();

            if (now < lockedUntilRef.current) {
                return;
            }

            wheelDeltaRef.current += normalizeWheelDelta(event);

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

            if (isInteractiveTarget(event.target)) {
                return;
            }

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
            if (scrollAnimationFrameRef.current !== null) {
                window.cancelAnimationFrame(scrollAnimationFrameRef.current);
            }
            document.documentElement.classList.remove("section-scroll-controlled");
        };
    }, []);

    return null;
}
