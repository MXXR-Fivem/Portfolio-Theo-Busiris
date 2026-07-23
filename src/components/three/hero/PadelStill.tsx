/**
 * The hero without a single line of WebGL: same framing and palette as the
 * scene at rest. Shown while the canvas boots, and kept for reduced motion,
 * missing WebGL and devices that would not hold a frame rate.
 */
export default function PadelStill() {
    return (
        <svg
            viewBox="0 0 520 460"
            role="img"
            aria-label="Stylised padel player standing behind the net"
            className="h-full w-full"
        >
            <circle cx="260" cy="220" r="160" fill="var(--identity-accent-quiet)" />

            {/* Player, mirroring the resting pose of the 3D scene */}
            <g>
                <ellipse cx="260" cy="392" rx="52" ry="9" fill="rgba(43, 46, 42, 0.09)" />

                <rect x="243" y="290" width="16" height="98" rx="8" fill="#c8a68b" />
                <rect x="263" y="290" width="16" height="98" rx="8" fill="#c8a68b" />
                <rect x="239" y="380" width="22" height="12" rx="5" fill="var(--identity-text)" />
                <rect x="261" y="380" width="22" height="12" rx="5" fill="var(--identity-text)" />

                <rect x="234" y="262" width="52" height="46" rx="16" fill="#7d9268" />
                <rect x="236" y="182" width="48" height="92" rx="22" fill="#fbfaf6" />

                <rect x="218" y="188" width="15" height="84" rx="7.5" fill="#c8a68b" />
                <rect x="287" y="188" width="15" height="84" rx="7.5" fill="#c8a68b" />

                <rect x="252" y="160" width="16" height="18" fill="#c8a68b" />
                <ellipse cx="260" cy="146" rx="25" ry="27" fill="#c8a68b" />
                <path
                    d="M235 142a25 27 0 0 1 50 0c0-16-11-25-25-25s-25 9-25 25z"
                    fill="var(--identity-text)"
                />

                {/* Racket held low, next to the hitting hand */}
                <g transform="rotate(12 300 286)">
                    <rect x="295" y="266" width="9" height="24" rx="4.5" fill="var(--identity-text)" />
                    <ellipse cx="299" cy="308" rx="21" ry="26" fill="#e2d9c6" />
                </g>
            </g>

            {/* Net */}
            <g stroke="rgba(43, 46, 42, 0.14)" strokeWidth="1.4">
                {Array.from({ length: 17 }).map((_, index) => (
                    <line
                        key={`v-${index}`}
                        x1={24 + index * 29}
                        y1="332"
                        x2={24 + index * 29}
                        y2="404"
                    />
                ))}
                {Array.from({ length: 4 }).map((_, index) => (
                    <line
                        key={`h-${index}`}
                        x1="24"
                        y1={332 + index * 24}
                        x2="488"
                        y2={332 + index * 24}
                    />
                ))}
            </g>
            <rect x="20" y="326" width="480" height="7" rx="3.5" fill="#e6e0d2" />

            <circle cx="392" cy="96" r="10" fill="var(--identity-accent)" />
        </svg>
    );
}
