/** The desk seen from above, lit as late afternoon, for the no-canvas path. */
export default function DeskStill() {
    return (
        <svg
            viewBox="0 0 460 420"
            role="img"
            aria-label="Stylised desk seen from above with a person typing"
            className="h-full w-full"
        >
            <ellipse cx="230" cy="250" rx="180" ry="120" fill="var(--identity-accent-quiet)" />

            {/* Desk surface */}
            <rect x="52" y="150" width="356" height="180" rx="14" fill="#e8dfcc" />
            <rect x="52" y="316" width="356" height="14" rx="7" fill="#d3c7ae" />

            {/* Screen */}
            <rect x="140" y="106" width="180" height="104" rx="8" fill="var(--identity-text)" />
            <rect x="150" y="115" width="160" height="86" rx="5" fill="#a9cbe8" />
            <rect x="162" y="130" width="88" height="7" rx="3.5" fill="#7fa9cd" />
            <rect x="162" y="146" width="120" height="7" rx="3.5" fill="#7fa9cd" />
            <rect x="162" y="162" width="70" height="7" rx="3.5" fill="#7fa9cd" />
            <rect x="212" y="210" width="36" height="12" rx="4" fill="var(--identity-text)" />

            {/* Keyboard, mug, notebook */}
            <rect x="160" y="236" width="140" height="42" rx="8" fill="#d8d2c4" />
            <circle cx="342" cy="248" r="20" fill="#9caf88" />
            <circle cx="342" cy="248" r="12" fill="#e8eee0" />
            <rect x="72" y="232" width="62" height="46" rx="6" fill="#e2d9c6" transform="rotate(-9 103 255)" />

            {/* Person, seen from above */}
            <ellipse cx="230" cy="392" rx="86" ry="30" fill="#7d9268" />
            <rect x="186" y="300" width="26" height="74" rx="13" fill="#c8a68b" transform="rotate(14 199 337)" />
            <rect x="248" y="300" width="26" height="74" rx="13" fill="#c8a68b" transform="rotate(-14 261 337)" />
            <rect x="186" y="272" width="32" height="20" rx="7" fill="#c8a68b" />
            <rect x="242" y="272" width="32" height="20" rx="7" fill="#c8a68b" />
            <circle cx="230" cy="356" r="34" fill="#c8a68b" />
            <circle cx="230" cy="352" r="34" fill="var(--identity-text)" />
        </svg>
    );
}
