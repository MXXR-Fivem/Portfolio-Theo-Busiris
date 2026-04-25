"use client";

import { useEffect, useRef } from "react";

const SCROLL_COOLDOWN_MS = 800;
const MIN_WHEEL_DELTA = 18;
const MIN_TOUCH_DELTA = 42;

function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest("input, textarea, select"));
}

function getSections() {
    return Array.from(document.querySelectorAll<HTMLElement>("main > section"));
}

function getCurrentSectionIndex(sections: HTMLElement[]) {
    const viewportAnchor = window.scrollY + window.innerHeight * 0.38;

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
    const touchStartYRef = useRef<number | null>(null);
    const touchTargetIsInteractiveRef = useRef(false);

    useEffect(() => {
        function scrollToSection(index: number) {
            const sections = getSections();
            const target = sections[index];

            if (!target) {
                return;
            }

            window.scrollTo({
                top: target.offsetTop,
                behavior: "smooth",
            });
        }

        function goToSection(direction: 1 | -1) {
            const sections = getSections();

            if (!sections.length) {
                return;
            }

            const currentIndex = getCurrentSectionIndex(sections);
            const nextIndex = Math.min(
                Math.max(currentIndex + direction, 0),
                sections.length - 1
            );

            if (nextIndex !== currentIndex) {
                scrollToSection(nextIndex);
            }
        }

        function onWheel(event: WheelEvent) {
            if (isInteractiveTarget(event.target)) {
                return;
            }

            const now = Date.now();

            event.preventDefault();

            if (Math.abs(event.deltaY) < MIN_WHEEL_DELTA) {
                return;
            }

            if (now < lockedUntilRef.current) {
                return;
            }

            lockedUntilRef.current = now + SCROLL_COOLDOWN_MS;
            goToSection(event.deltaY > 0 ? 1 : -1);
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

        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onTouchEnd);

        return () => {
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, []);

    return null;
}
