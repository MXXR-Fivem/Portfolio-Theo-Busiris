"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { navItems, profile } from "@/data/site";
import { scrollToSelector } from "@/lib/smoothScroll";

function scrollToAnchor(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) {
        return;
    }

    if (!document.querySelector(href)) {
        return;
    }

    event.preventDefault();
    window.history.pushState(null, "", href);
    scrollToSelector(href);
}

export default function Navbar() {
    return (
        <div className="fixed left-0 top-0 z-50 hidden w-full px-4 pt-3 sm:px-6 sm:pt-4 lg:block lg:px-8">
            <header className="section-shell">
                <div className="flex items-center justify-between rounded-[var(--identity-radius-panel)] border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-3.5 shadow-[var(--shadow-nav)] sm:px-6 sm:py-4">
                    <Link
                        href="#top"
                        onClick={(event) => scrollToAnchor(event, "#top")}
                        className="flex items-center gap-3"
                    >
                        {/* <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.75rem] bg-[var(--identity-accent-primary)] text-sm font-semibold text-[var(--color-surface)]">
                            TB
                        </span> */}
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-[var(--color-ink)]">{profile.name}</p>
                            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
                                Fullstack Developer
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-6 lg:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(event) => scrollToAnchor(event, item.href)}
                                className="text-sm text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <Link
                        href="#contact"
                        onClick={(event) => scrollToAnchor(event, "#contact")}
                        className="rounded-[var(--identity-radius-control)] bg-[var(--identity-accent-quiet)] px-4 py-2 text-sm font-medium text-[var(--color-accent-ink)] transition-colors duration-300 hover:bg-[var(--color-accent)] hover:text-[#f7f9f4]"
                    >
                        Contact
                    </Link>
                </div>
            </header>
        </div>
    );
}
