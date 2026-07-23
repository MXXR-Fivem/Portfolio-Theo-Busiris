import type Lenis from "lenis";

let activeInstance: Lenis | null = null;

export function registerSmoothScroll(instance: Lenis | null) {
    activeInstance = instance;
}

/**
 * Anchor navigation that stays in sync with Lenis when it runs, and falls back
 * to the native behaviour when smooth scrolling is disabled.
 */
export function scrollToSelector(selector: string) {
    const target = document.querySelector<HTMLElement>(selector);

    if (!target) {
        return;
    }

    if (activeInstance) {
        activeInstance.scrollTo(target, { offset: 0 });
        return;
    }

    target.scrollIntoView({ behavior: "auto", block: "start" });
}
