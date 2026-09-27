import type { MetadataRoute } from "next";

const siteUrl = "https://www.busiristheo.com";

// AI crawlers listed explicitly (on top of the wildcard allow) so GEO tools
// that only check for named user-agents see they are welcome here too.
const aiCrawlers = [
    "GPTBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            { userAgent: "*", allow: "/" },
            ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/" })),
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
