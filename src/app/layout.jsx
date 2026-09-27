import localFont from "next/font/local";
import "./globals.css";
import { profile, ventures } from "@/data/site";

const montserrat = localFont({
    variable: "--font-heading",
    display: "swap",
    src: [
        {
            path: "./fonts/Montserrat-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/Montserrat-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/Montserrat-SemiBold.woff2",
            weight: "600",
            style: "normal",
        },
    ],
});

const sourceCodePro = localFont({
    variable: "--font-code",
    display: "swap",
    src: [
        {
            path: "./fonts/SourceCodePro-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/SourceCodePro-Medium.woff2",
            weight: "500",
            style: "normal",
        },
    ],
});

const siteUrl = "https://www.busiristheo.com";
const title = "Théo Busiris | Fullstack Developer, Co-founder of Vibaura";
const description =
    "Portfolio of Théo Busiris: fullstack, mobile and backend developer at Epitech Paris, co-founder and tech lead at Vibaura and Gosper.";

export const metadata = {
    title,
    description,
    metadataBase: new URL(siteUrl),
    keywords: [
        "Théo Busiris",
        "fullstack developer",
        "mobile developer",
        "backend developer",
        "Vibaura",
        "Gosper",
        "Epitech Paris",
        "Next.js developer",
        "React Native developer",
        "Paris developer portfolio",
    ],
    authors: [{ name: profile.name, url: siteUrl }],
    creator: profile.name,
    alternates: {
        canonical: siteUrl,
    },
    verification: {
        google: "Uil-THyTd9IE8LGFWCzxJoeKBxiL7l7BfzXFQYgvhew",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
    openGraph: {
        title,
        description:
            "Fullstack, mobile and backend developer. Co-founder and tech lead at Vibaura. Projects, skills, live business stats and contact.",
        url: siteUrl,
        siteName: "Théo Busiris Portfolio",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title,
        description:
            "Fullstack, mobile and backend developer. Co-founder and tech lead at Vibaura. Projects, skills, live business stats and contact.",
    },
};

export const viewport = {
    colorScheme: "light",
    themeColor: "#f5f2ec",
};

const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Person",
            "@id": `${siteUrl}/#person`,
            name: profile.name,
            url: siteUrl,
            image: `${siteUrl}/hero-still.webp`,
            jobTitle: profile.role,
            email: `mailto:${profile.email}`,
            address: {
                "@type": "PostalAddress",
                addressLocality: "Paris",
                addressCountry: "FR",
            },
            sameAs: [profile.github, profile.linkedin],
            worksFor: ventures.map((venture) => ({
                "@type": "Organization",
                name: venture.name,
                url: venture.url,
            })),
        },
        {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            url: siteUrl,
            name: "Théo Busiris Portfolio",
            inLanguage: "en",
            publisher: { "@id": `${siteUrl}/#person` },
        },
    ],
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} ${sourceCodePro.variable}`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
                {children}
            </body>
        </html>
    );
}
