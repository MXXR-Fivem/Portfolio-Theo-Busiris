export type HeroLink = {
    label: string;
    href: string;
};

export type Project = {
    slug: string;
    title: string;
    tagline: string;
    summary: string;
    problem: string;
    outcome: string;
    stack: string[];
    image: string;
    accent: string;
    liveUrl?: string;
    githubUrl?: string;
    featured?: boolean;
};

export type LinkedProject = {
    name: string;
    /** Omitted when the project has no dedicated mark, only a screenshot. */
    logo?: string;
    logoWidth?: number;
    logoHeight?: number;
    /** True when the logo is a bare mark and the name has to be set beside it. */
    showName?: boolean;
    href: string;
};

export type SkillGroup = {
    title: string;
    description: string;
    items: string[];
    linkedProjects?: LinkedProject[];
    status?: "learning";
};

export const profile = {
    name: "Théo Busiris",
    role: "Fullstack, mobile and backend developer",
    subtitle:
        "Epitech Paris student and co-founder of Vibaura and Gosper, building products from real constraints.",
    heroTitle: "I build clean, useful and ready to ship digital products.",
    heroDescription:
        "Fullstack, mobile and backend. Co-founder of Vibaura, a padel ranking platform, and of Gosper, an AI gateway for companies.",
    email: "contact@busiristheo.com",
    location: "Paris, France",
    github: "https://github.com/MXXR-Fivem",
    linkedin: "https://linkedin.com/in/theobusiris",
    cv: "/cv_no_stage_no_num.pdf",
    heroLinks: [
        { label: "GitHub", href: "https://github.com/MXXR-Fivem" },
        { label: "LinkedIn", href: "https://linkedin.com/in/theobusiris" },
    ] satisfies HeroLink[],
};

export type Venture = {
    name: string;
    url?: string;
    logo: string;
    logoWidth: number;
    logoHeight: number;
    role: string;
    /** True when the logo is a bare mark and the name has to be set beside it. */
    showName?: boolean;
};

/** The companies, kept apart from the project cards so the hero can lead with them. */
export const ventures: Venture[] = [
    {
        name: "Vibaura",
        url: "https://vibaura.app",
        logo: "/vibaura-wordmark.png",
        logoWidth: 360,
        logoHeight: 74,
        role: "Co-founder & Tech Lead",
    },
    {
        name: "Gosper",
        url: "https://gosper.fr",
        logo: "/gosper-mark.png",
        logoWidth: 256,
        logoHeight: 256,
        role: "Co-founder & Tech Lead",
        showName: true,
    },
];

export const quickFacts = [
    {
        title: "Product-minded",
        description: "Usefulness first. Every feature has to earn its place.",
    },
    {
        title: "Fullstack range",
        description: "Frontend, backend, mobile, data, deployment. The whole chain.",
    },
    {
        title: "Execution habits",
        description: "Clean delivery, reusable architecture, short feedback loops.",
    },
];

export const aboutHighlights = [
    "Same reflex since the start: learn fast, ship something concrete, fix the weak parts, repeat.",
    "Epitech Paris on one side, a company on the other. At Vibaura I lead the tech: API contracts, the Flutter app, the deployment path.",
    "What I chase: a clear problem, an interface that stays clean under complexity, a backend that holds when usage grows.",
];

export const proofPoints = [
    {
        eyebrow: "FiveM store",
        title: "Real customers, real support",
        description:
            "A Tebex store taught me delivery, support, repeat buyers and long-term maintenance.",
    },
    {
        eyebrow: "Client trust",
        title: "Feedback counts as much as shipping",
        description:
            "Reviews are pulled in automatically: quality and follow-up are part of the work.",
    },
];

export const projects: Project[] = [
    {
        slug: "vibaura",
        title: "Vibaura",
        tagline: "Co-founder and tech lead. Live at vibaura.app.",
        summary:
            "A padel platform: an Elo-style ranking, strictly validated match results, a social feed and partner-ready ranking widgets. Flutter app, Next.js site and back-office, NestJS API, all typed from one OpenAPI contract.",
        problem:
            "Padel has no trusted ranking. Scores live in group chats and no level is comparable.",
        outcome:
            "A shipped platform where I own the architecture, the contracts and the release path.",
        stack: ["NestJS", "PostgreSQL", "Prisma", "Flutter", "Next.js", "OpenAPI", "Docker", "CI/CD"],
        image: "/vibaura.png",
        accent: "from-lime-300 via-emerald-400 to-green-500",
        liveUrl: "https://vibaura.app",
        featured: true,
    },
    {
        slug: "gosper",
        title: "Gosper",
        tagline: "Co-founder and tech lead. An AI gateway companies can govern.",
        summary:
            "Every model behind one login: employees get a private chat to OpenAI, Anthropic, Google and Mistral, while the company keeps budgets, access and logs. Claude Code and Codex plug in unmodified.",
        problem:
            "Employees already use generative AI on personal accounts, outside any oversight. Banning it does not work.",
        outcome:
            "A multi-tenant platform that sees metadata, never the conversations: isolation enforced in PostgreSQL, spend caps that refuse a request before it reaches the provider, leak tests that block CI.",
        stack: ["NestJS", "PostgreSQL", "Prisma", "Next.js", "Redis", "ts-rest", "Docker"],
        image: "/gosper.png",
        accent: "from-rose-300 via-fuchsia-400 to-purple-500",
        liveUrl: "https://gosper.fr",
        featured: true,
    },
    {
        slug: "smartlinks-v2",
        title: "Smartlinks V2 at Base for Music",
        tagline: "Three-month internship. A whole feature, built from scratch.",
        summary:
            "The V2 of Base for Music's smartlinks, written entirely on my own from an empty repo: one public page per release where a listener picks Spotify, Deezer, Apple Music or YouTube, adds the track to their playlist or opens it on the platform.",
        problem:
            "A release lives on every streaming platform at once. Fans need a single link that takes them to their own service.",
        outcome:
            "One feature owned end to end: front, back and data, inside the company's Turborepo monorepo.",
        stack: ["Next.js", "React", "Mantine", "NestJS", "Kysely", "PostgreSQL", "Turborepo"],
        image: "/smartlinks-v2.jpg",
        accent: "from-emerald-300 via-teal-400 to-cyan-500",
        featured: true,
    },
    {
        slug: "fivem-store",
        title: "FiveM script store",
        tagline: "A niche product business around Lua scripts.",
        summary:
            "A Tebex store where I build, sell and support the scripts FiveM communities run, with distribution through Discord.",
        problem:
            "Server owners need reliable scripts, updates and direct support, not one-shot downloads.",
        outcome: "A real business: delivery, customer support and long-term maintenance.",
        stack: ["Lua", "TypeScript", "SQL", "Tebex", "Discord"],
        image: "/mxxrshop.png",
        accent: "from-amber-300 via-orange-400 to-orange-500",
        liveUrl: "https://mxxr.tebex.io",
        featured: true,
    },
    {
        slug: "starz",
        title: "Starz.work",
        tagline: "A job aggregator for tech talents.",
        summary:
            "A fullstack job and internship aggregator with candidate, recruiter and admin spaces, dashboards and offer aggregation.",
        problem:
            "Students search across scattered platforms with no read on relevance, salary or required skills.",
        outcome:
            "An end-to-end platform with CI/CD and an AI CV-to-offer compatibility score.",
        stack: ["React", "Express", "FastAPI", "MySQL", "Docker", "Nginx", "CI/CD"],
        image: "/Starz.jpg",
        accent: "from-violet-400 via-purple-500 to-fuchsia-600",
        liveUrl: "https://starz.work",
        githubUrl: "https://github.com/MXXR-Fivem/starz.work",
        featured: true,
    },
    {
        slug: "padel-hub",
        title: "Padel Hub",
        tagline: "A mobile-first padel community app.",
        summary:
            "Posts, direct messages, groups, coach discovery and match organisation, in one padel-only product.",
        problem:
            "Players juggle several tools to find courts, organise sessions and stay in touch.",
        outcome: "A sharper mobile experience built for one sport and one audience.",
        stack: ["React Native", "Expo", "Docker", "Product Design"],
        image: "/padel_hub.png",
        accent: "from-lime-300 via-emerald-400 to-green-500",
        liveUrl: "https://github.com/MXXR-Fivem/Padel-hub",
        githubUrl: "https://github.com/MXXR-Fivem/Padel-hub",
    },
    {
        slug: "eco-go",
        title: "Eco-Go",
        tagline: "Public climate data, made readable.",
        summary:
            "Hackathon project comparing environmental action across French municipalities.",
        problem:
            "Open environmental datasets are too dense for citizens who just want a comparison.",
        outcome: "A data prototype that turns public records into something people can read.",
        stack: ["React Native", "Expo", "Docker", "Public Data"],
        image: "/ecogo.png",
        accent: "from-emerald-300 via-green-400 to-teal-500",
        liveUrl:
            "https://github.com/MXXR-Fivem/Hackathon-Data-Climate-TheShifters-Epitech",
        githubUrl:
            "https://github.com/MXXR-Fivem/Hackathon-Data-Climate-TheShifters-Epitech",
    },
    {
        slug: "kaiju",
        title: "Kaiju — Crisis Manager",
        tagline: "Real-time emergency coordination under strict constraints.",
        summary:
            "A crisis management platform for Tokyork: resource reservations, inter-district transfers under strict allocation rules, maritime routes, escalation levels, and live WebSocket alerts with a tactical HUD.",
        problem:
            "Emergency resource allocation cannot rely on client trust: retention thresholds, adjacency requirements, transits, and role permissions must be strictly enforced server-side.",
        outcome:
            "A high-reliability Rust backend with Actix Web, SQLite and SQLx, explicit HTTP error codes for every business violation, a native WebSocket event hub, Playwright E2E suites, and a live deployment.",
        stack: ["Rust", "Actix Web", "SQLx", "SQLite", "Angular", "Leaflet", "WebSocket", "Docker"],
        image: "/kaiju.png",
        accent: "from-emerald-400 via-green-500 to-teal-600",
        liveUrl: "https://kaiju.busiristheo.com",
        githubUrl: "https://github.com/MXXR-Fivem/Kaiju",
    },
    {
        slug: "tardis",
        title: "Tardis",
        tagline: "Predicting SNCF train delays.",
        summary:
            "Exploratory analysis and modelling of rail delays, surfaced through a readable interface.",
        problem: "Delay data is noisy and says nothing without modelling and clear visuals.",
        outcome: "Sharpened my ML workflow and turned notebooks into something users can open.",
        stack: ["Python", "Machine Learning", "Streamlit", "Data Analysis"],
        image: "/tardis.png",
        accent: "from-violet-400 via-indigo-500 to-blue-600",
        liveUrl: "https://sncf-train-delay-epitech.streamlit.app/",
        githubUrl: "https://github.com/MXXR-Fivem/SNCF-train-delay-prediction",
    },
    {
        slug: "nextbuy",
        title: "NextBuy",
        tagline: "Business signals inside supermarket data.",
        summary: "Analysis and ML on retail data, from raw rows to concrete priorities.",
        problem: "Commercial data does not help a decision until it becomes readable insight.",
        outcome: "Practised tying analysis to product calls, not models for their own sake.",
        stack: ["Python", "Data Analysis", "Machine Learning", "Streamlit"],
        image: "/nextbuy.png",
        accent: "from-fuchsia-400 via-pink-400 to-amber-300",
        liveUrl: "https://shop-business-analyses-epitech.streamlit.app/",
        githubUrl: "https://github.com/MXXR-Fivem/Shop-business-analyses",
    },
    {
        slug: "inspir",
        title: "Inspir social to-do app",
        tagline: "My first serious fullstack product.",
        summary:
            "A social to-do app shipped in three weeks: full web stack, dedicated backend, containerised deployment.",
        problem: "Shipping fast means holding scope and technical consistency at the same time.",
        outcome:
            "The milestone where frontend, API, database and deployment first read as one system.",
        stack: ["Next.js", "Express", "MySQL", "Docker"],
        image: "/inspir.png",
        accent: "from-cyan-400 via-blue-500 to-violet-500",
        liveUrl: "https://inspir.busiristheo.com/",
        githubUrl: "https://github.com/MXXR-Fivem/Inspir-Social-to-do-list-website",
    },
    {
        slug: "nlp-books",
        title: "NLP book classification",
        tagline: "A lightweight NLP engine for literary datasets.",
        summary:
            "A CLI-oriented NLP pipeline classifying Project Gutenberg books for editors and publishers.",
        problem: "Sorting large book collections by hand is slow, inconsistent and unscalable.",
        outcome: "Solid foundations in NLP pipelines and text tooling on a real dataset.",
        stack: ["Python", "NLP", "CLI", "Data Processing"],
        image: "/alice.png",
        accent: "from-rose-400 via-fuchsia-500 to-red-500",
        liveUrl: "https://nlp-book-classification-epitech.streamlit.app/",
        githubUrl: "https://github.com/MXXR-Fivem/NLP-Book-classification",
    },
];

/** Reused wherever a skill traces back to one of the two companies. */
const VIBAURA_LINK: LinkedProject = {
    name: "Vibaura",
    logo: "/vibaura-wordmark.png",
    logoWidth: 360,
    logoHeight: 74,
    href: "#projects",
};
const GOSPER_LINK: LinkedProject = {
    name: "Gosper",
    logo: "/gosper-mark.png",
    logoWidth: 256,
    logoHeight: 256,
    showName: true,
    href: "#projects",
};

/** The rest of the projects have no dedicated mark, just a name. */
const link = (name: string): LinkedProject => ({ name, href: "#projects" });

export const skillGroups: SkillGroup[] = [
    {
        title: "Frontend",
        description: "Interfaces that stay readable and aligned with the product.",
        items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "UI architecture"],
        linkedProjects: [VIBAURA_LINK, GOSPER_LINK, link("Smartlinks V2"), link("Starz.work"), link("Inspir")],
    },
    {
        title: "Backend",
        description: "APIs and server logic built to stay maintainable.",
        items: ["NestJS", "Node.js", "Express", "REST APIs", "SQL modeling"],
        linkedProjects: [VIBAURA_LINK, GOSPER_LINK, link("Kaiju"), link("Smartlinks V2"), link("Starz.work"), link("Inspir")],
    },
    {
        title: "Low-level languages",
        description: "Learning lower-level work: memory, performance, systems thinking.",
        items: ["C", "Rust"],
        linkedProjects: [link("Kaiju")],
        status: "learning",
    },
    {
        title: "Mobile",
        description: "Product ideas shipped to mobile, focused on flow and usability.",
        items: ["Flutter", "React Native", "Expo", "Mobile UX"],
        linkedProjects: [VIBAURA_LINK, link("Padel Hub"), link("Eco-Go")],
    },
    {
        title: "Databases",
        description: "Structuring and querying app data without overcomplicating it.",
        items: ["PostgreSQL", "MySQL", "Prisma", "Data modeling"],
        linkedProjects: [VIBAURA_LINK, GOSPER_LINK, link("Smartlinks V2"), link("Starz.work"), link("Inspir")],
    },
    {
        title: "DevOps & deployment",
        description: "From local development to a clean shipping path.",
        items: ["Docker", "CI/CD", "Vercel", "VM deployment"],
        linkedProjects: [VIBAURA_LINK, GOSPER_LINK, link("Starz.work"), link("Inspir")],
    },
    {
        title: "AI & data",
        description: "Analysis and ML when they actually explain or predict something.",
        items: ["Python", "Machine Learning", "NLP", "Streamlit", "Data exploration"],
        linkedProjects: [link("Tardis"), link("NextBuy"), link("NLP classification")],
    },
    {
        title: "Tools",
        description: "The tooling that keeps engineering delivery practical.",
        items: ["Git", "GitHub", "Figma", "Notion", "VS Code"],
    },
];

export const navItems = [
    { label: "About", href: "#about" },
    { label: "Proof", href: "#proof" },
    { label: "Projects", href: "#projects" },
    { label: "Skills", href: "#skills" },
    { label: "Reviews", href: "#reviews" },
];
