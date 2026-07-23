/** Two cats, mid-stride, for every case where the canvas never mounts. */
export default function CatsStill() {
    return (
        <svg
            viewBox="0 0 640 150"
            role="img"
            aria-label="Two stylised cats walking"
            className="h-full w-full"
        >
            <g transform="translate(250 22)">
                <ellipse cx="60" cy="118" rx="62" ry="7" fill="rgba(43, 46, 42, 0.07)" />
                <rect x="16" y="86" width="11" height="30" rx="5.5" fill="#6f7566" />
                <rect x="46" y="86" width="11" height="30" rx="5.5" fill="#6f7566" />
                <rect x="74" y="86" width="11" height="30" rx="5.5" fill="#6f7566" />
                <rect x="100" y="86" width="11" height="30" rx="5.5" fill="#6f7566" />
                <path d="M10 78c-14-6-16-26-6-38" stroke="#6f7566" strokeWidth="11" strokeLinecap="round" fill="none" />
                <rect x="12" y="56" width="102" height="42" rx="21" fill="#6f7566" />
                <rect x="30" y="72" width="70" height="24" rx="12" fill="#cfd4c2" />
                <circle cx="122" cy="60" r="23" fill="#6f7566" />
                <path d="M104 44l4-18 15 12z" fill="#6f7566" />
                <path d="M130 40l14-14 5 18z" fill="#6f7566" />
                <circle cx="132" cy="58" r="10" fill="#cfd4c2" />
                <circle cx="140" cy="57" r="3.5" fill="#b98a7f" />
                <circle cx="126" cy="52" r="3" fill="var(--identity-text)" />
            </g>

            <g transform="translate(370 8) scale(1.08)">
                <ellipse cx="60" cy="118" rx="66" ry="7" fill="rgba(43, 46, 42, 0.07)" />
                <rect x="16" y="86" width="12" height="32" rx="6" fill="#b8a68d" />
                <rect x="48" y="86" width="12" height="32" rx="6" fill="#b8a68d" />
                <rect x="76" y="86" width="12" height="32" rx="6" fill="#b8a68d" />
                <rect x="104" y="86" width="12" height="32" rx="6" fill="#b8a68d" />
                <path d="M10 78c-16-4-20-28-8-42" stroke="#b8a68d" strokeWidth="12" strokeLinecap="round" fill="none" />
                <rect x="12" y="54" width="108" height="44" rx="22" fill="#b8a68d" />
                <rect x="30" y="72" width="74" height="24" rx="12" fill="#efe7d8" />
                <circle cx="128" cy="58" r="24" fill="#b8a68d" />
                <path d="M109 41l4-19 16 13z" fill="#b8a68d" />
                <path d="M136 38l15-15 5 19z" fill="#b8a68d" />
                <circle cx="139" cy="56" r="10.5" fill="#efe7d8" />
                <circle cx="147" cy="55" r="3.6" fill="#b98a7f" />
                <circle cx="132" cy="50" r="3.2" fill="var(--identity-text)" />
            </g>
        </svg>
    );
}
