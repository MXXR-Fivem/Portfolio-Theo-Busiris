"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function handleNavClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
        scrollToAnchor(event, href);
        setIsMenuOpen(false);
    }

    return (
        <div className="fixed left-0 top-0 z-50 w-full px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8">
            <header className="section-shell">
                <div className="flex items-center justify-between rounded-[var(--identity-radius-panel)] border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-3.5 shadow-[var(--shadow-nav)] sm:px-6 sm:py-4">
                    <Link
                        href="#top"
                        onClick={(event) => handleNavClick(event, "#top")}
                        className="flex items-center gap-3"
                    >
                        {/* <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.75rem] bg-[var(--identity-accent-primary)] text-sm font-semibold text-[var(--color-surface)]">
                            TB
                        </span> */}
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-[var(--color-ink)]">{profile.name}</p>
                            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
                                Fullstack · Co-founder @ Vibaura & Gosper
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-6 lg:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(event) => handleNavClick(event, item.href)}
                                className="text-sm text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <Link
                        href="#contact"
                        onClick={(event) => handleNavClick(event, "#contact")}
                        className="hidden rounded-[var(--identity-radius-control)] bg-[var(--identity-accent-quiet)] px-4 py-2 text-sm font-medium text-[var(--color-accent-ink)] transition-colors duration-300 hover:bg-[var(--color-accent)] hover:text-[#f7f9f4] lg:inline-block"
                    >
                        Contact
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((open) => !open)}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-nav-menu"
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--identity-radius-control)] border border-[var(--color-line)] text-[var(--color-ink)] transition-colors duration-300 hover:bg-[var(--identity-accent-quiet)] lg:hidden"
                    >
                        {isMenuOpen ? <HiOutlineXMark className="h-5 w-5" /> : <HiOutlineBars3 className="h-5 w-5" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <nav
                        id="mobile-nav-menu"
                        className="mt-2 flex flex-col gap-1 rounded-[var(--identity-radius-panel)] border border-[var(--color-line)] bg-[var(--color-card)] p-3 shadow-[var(--shadow-nav)] lg:hidden"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(event) => handleNavClick(event, item.href)}
                                className="rounded-[var(--identity-radius-control)] px-3 py-2 text-sm text-[var(--color-ink-soft)] transition hover:bg-[var(--identity-accent-quiet)] hover:text-[var(--color-ink)]"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            href="#contact"
                            onClick={(event) => handleNavClick(event, "#contact")}
                            className="mt-1 rounded-[var(--identity-radius-control)] bg-[var(--identity-accent-quiet)] px-3 py-2 text-center text-sm font-medium text-[var(--color-accent-ink)] transition-colors duration-300 hover:bg-[var(--color-accent)] hover:text-[#f7f9f4]"
                        >
                            Contact
                        </Link>
                    </nav>
                )}
            </header>
        </div>
    );
}
