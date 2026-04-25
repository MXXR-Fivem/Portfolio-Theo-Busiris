"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { navItems, profile } from "@/data/site";

function scrollToAnchor(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("#")) {
        return;
    }

    const target = document.querySelector<HTMLElement>(href);

    if (!target) {
        return;
    }

    event.preventDefault();
    window.history.pushState(null, "", href);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
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
                        {/* <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.75rem] bg-[var(--identity-accent-primary)] text-sm font-semibold text-slate-950">
                            TB
                        </span> */}
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-white">{profile.name}</p>
                            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
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
                                className="text-sm text-slate-300 transition hover:text-white"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <Link
                        href="#contact"
                        onClick={(event) => scrollToAnchor(event, "#contact")}
                        className="rounded-[var(--identity-radius-control)] border border-[var(--identity-border-strong)] bg-[var(--identity-accent-quiet)] px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--identity-accent-primary)]"
                    >
                        Contact
                    </Link>
                </div>
            </header>
        </div>
    );
}
