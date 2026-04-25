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

export type SkillGroup = {
    title: string;
    description: string;
    items: string[];
    projectLink?: string;
    status?: "learning";
};

export const profile = {
    name: "Théo Busiris",
    role: "Fullstack, mobile and backend developer",
    subtitle:
        "Epitech Paris student building useful products, solid APIs and polished interfaces from real-world constraints.",
    heroTitle: "I build clean, useful and ready to ship digital products.",
    // heroTitle: "I build digital products that are clean, useful and ready to ship.",
    heroDescription:
        "I focus on turning concrete ideas into maintainable fullstack systems, mobile experiences and backend flows that feel reliable in production, not just in demos.",
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

export const quickFacts = [
    {
        title: "Product-minded",
        description: "I care about usefulness, clarity and why a feature should exist.",
    },
    {
        title: "Fullstack range",
        description: "Frontend, backend, mobile, data and deployment when a product needs the full chain.",
    },
    {
        title: "Execution habits",
        description: "I like clean delivery, reusable architecture and direct feedback loops.",
    },
];

export const aboutHighlights = [
    "I started building around code early and kept the same reflex since then: learn fast, ship something concrete, improve the weak parts, repeat.",
    "At Epitech Paris, I am not only studying engineering principles. I already use them on projects that involve product thinking, API design, mobile UX, data work and deployment constraints.",
    "I am particularly motivated by products that solve a clear problem, interfaces that stay clean under complexity, and backend foundations that remain stable when usage grows.",
];

export const proofPoints = [
    {
        eyebrow: "FiveM store",
        title: "Real customers, real support, real iterations",
        description:
            "My Tebex-powered FiveM business gave me hands-on experience with delivery, support, feedback, repeat purchases and long-term maintenance.",
    },
    {
        eyebrow: "Client trust",
        title: "Feedback matters as much as shipping",
        description:
            "Customer reviews are pulled automatically and presented as proof that quality, responsiveness and follow-up are part of the work.",
    },
];

export const projects: Project[] = [
    {
        slug: "fivem-store",
        title: "FiveM script store",
        tagline: "Running a niche product business around Lua scripts.",
        summary:
            "A Tebex-based store where I design, sell and maintain scripts used by FiveM communities, with ongoing support and distribution through Discord and content channels.",
        problem:
            "Game server owners need reliable scripts, updates and direct technical support instead of one-shot downloads.",
        outcome:
            "Built a concrete business around product delivery, customer support and long-term script maintenance.",
        stack: ["Lua", "TypeScript", "SQL", "Tebex", "Discord"],
        image: "/mxxrshop.png",
        accent: "from-amber-300 via-orange-400 to-orange-500",
        liveUrl: "https://mxxr.tebex.io",
        featured: true,
    },
    {
        slug: "padel-hub",
        title: "Padel Hub",
        tagline: "A mobile product designed around padel community.",
        summary:
            "A padel-first social and booking experience bringing together posts, direct messages, groups, coaching discovery and match organization in one product.",
        problem:
            "Padel players jump between fragmented tools to discover courts, organize sessions and stay connected to the community.",
        outcome:
            "Explored a more intentional mobile experience shaped around one sport, one audience and concrete social actions.",
        stack: ["React Native", "Expo", "Docker", "Product Design"],
        image: "/padel_hub.png",
        accent: "from-lime-300 via-emerald-400 to-green-500",
        liveUrl: "https://github.com/MXXR-Fivem/Padel-hub",
        githubUrl: "https://github.com/MXXR-Fivem/Padel-hub",
        featured: true,
    },
    {
        slug: "eco-go",
        title: "Eco-Go",
        tagline: "Turning public climate data into a readable civic product.",
        summary:
            "Hackathon project comparing environmental action across French municipalities through a clearer and more accessible interface.",
        problem:
            "Public environmental datasets are often too dense for citizens who want understandable comparisons and actionable signals.",
        outcome:
            "Delivered a data-driven prototype combining product clarity, visualization and public-interest storytelling.",
        stack: ["React Native", "Expo", "Docker", "Public Data"],
        image: "/ecogo.png",
        accent: "from-emerald-300 via-green-400 to-teal-500",
        liveUrl:
            "https://github.com/MXXR-Fivem/Hackathon-Data-Climate-TheShifters-Epitech",
        githubUrl:
            "https://github.com/MXXR-Fivem/Hackathon-Data-Climate-TheShifters-Epitech",
    },
    {
        slug: "tardis",
        title: "Tardis",
        tagline: "Predicting and visualizing SNCF train delays.",
        summary:
            "A data product using exploratory analysis and modeling to surface delay patterns and expected train delays through an accessible interface.",
        problem:
            "Rail delay data is noisy and hard to interpret without analysis, modeling and clear visualization choices.",
        outcome:
            "Strengthened my workflow around ML experimentation, storytelling and turning notebooks into something visible for users.",
        stack: ["Python", "Machine Learning", "Streamlit", "Data Analysis"],
        image: "/tardis.png",
        accent: "from-violet-400 via-indigo-500 to-blue-600",
        liveUrl: "https://sncf-train-delay-epitech.streamlit.app/",
        githubUrl: "https://github.com/MXXR-Fivem/SNCF-train-delay-prediction",
    },
    {
        slug: "nextbuy",
        title: "NextBuy",
        tagline: "Finding business signals inside supermarket data.",
        summary:
            "A business analysis and ML project extracting trends, insights and optimization ideas from retail data.",
        problem:
            "Raw commercial data does not help decision-making until it is transformed into readable insight and priorities.",
        outcome:
            "Practiced linking analysis to product decisions, not only producing models for their own sake.",
        stack: ["Python", "Data Analysis", "Machine Learning", "Streamlit"],
        image: "/nextbuy.png",
        accent: "from-fuchsia-400 via-pink-400 to-amber-300",
        liveUrl: "https://shop-business-analyses-epitech.streamlit.app/",
        githubUrl: "https://github.com/MXXR-Fivem/Shop-business-analyses",
    },
    {
        slug: "inspir",
        title: "Inspir social to-do app",
        tagline: "A first serious fullstack product built end to end.",
        summary:
            "A social to-do application delivered in three weeks with a full web stack, a dedicated backend and containerized deployment.",
        problem:
            "Building a usable product quickly requires managing both feature scope and technical consistency across the stack.",
        outcome:
            "A strong first fullstack milestone that taught me how frontend, API, database and deployment decisions shape each other.",
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
            "A prototype CLI-oriented NLP workflow built on Project Gutenberg books to classify and structure literary content for editors and publishers.",
        problem:
            "Reading and sorting large book collections manually is slow, inconsistent and difficult to scale.",
        outcome:
            "Improved my foundations in NLP pipelines, text processing and building technical tools around real datasets.",
        stack: ["Python", "NLP", "CLI", "Data Processing"],
        image: "/alice.png",
        accent: "from-rose-400 via-fuchsia-500 to-red-500",
        liveUrl: "https://nlp-book-classification-epitech.streamlit.app/",
        githubUrl: "https://github.com/MXXR-Fivem/NLP-Book-classification",
    },
];

export const skillGroups: SkillGroup[] = [
    {
        title: "Frontend",
        description: "Building interfaces that stay readable, responsive and aligned with product goals.",
        items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "UI architecture"],
        projectLink: "Inspir social to-do app",
    },
    {
        title: "Backend",
        description: "Designing APIs and server logic with maintainability and reliability in mind.",
        items: ["Node.js", "Express", "REST APIs", "SQL modeling", "Business logic"],
        projectLink: "FiveM script store",
    },
    {
        title: "Low-level languages",
        description: "I am currently learning lower-level programming to strengthen my foundations around memory, performance and systems thinking.",
        items: ["C", "Rust"],
        status: "learning",
    },
    {
        title: "Mobile",
        description: "Shipping product ideas to mobile with a strong focus on flow and usability.",
        items: ["React Native", "Expo", "Mobile UX", "Component reuse"],
        projectLink: "Padel Hub",
    },
    {
        title: "Databases",
        description: "Structuring and querying application data without overcomplicating the stack.",
        items: ["MySQL", "SQL", "Data modeling", "Query design"],
        projectLink: "Inspir social to-do app",
    },
    {
        title: "DevOps & deployment",
        description: "Taking projects from local development to a cleaner shipping path.",
        items: ["Docker", "Vercel", "Environment setup", "Basic VM deployment"],
        projectLink: "Inspir social to-do app",
    },
    {
        title: "AI & data",
        description: "Using analysis and ML when they help explain, predict or classify useful information.",
        items: ["Python", "Machine Learning", "NLP", "Streamlit", "Data exploration"],
        projectLink: "Tardis / NextBuy / NLP",
    },
    {
        title: "Tools",
        description: "Working efficiently with the tooling that keeps engineering delivery practical.",
        items: ["Git", "GitHub", "Figma", "Notion", "VS Code"],
    },
];

export const ambitions = [
    {
        title: "Deeper backend architecture",
        text: "I want to get stronger on scalable backend design, clearer domain modeling and production-grade architecture decisions.",
    },
    {
        title: "Mobile products with stronger identity",
        text: "I want to push further on mobile experiences that feel focused, useful and distinct instead of generic clones.",
    },
    {
        title: "Cloud, AI and product execution",
        text: "My goal is to connect cloud infrastructure, practical AI and entrepreneurship to build products that solve concrete problems.",
    },
];

export const navItems = [
    { label: "About", href: "#about" },
    { label: "Proof", href: "#proof" },
    { label: "Projects", href: "#projects" },
    { label: "Skills", href: "#skills" },
    { label: "Reviews", href: "#reviews" },
    // { label: "Contact", href: "#contact" },
];
