import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Théo Busiris | Fullstack Developer",
        short_name: "Théo Busiris",
        description:
            "Portfolio of Théo Busiris: fullstack, mobile and backend developer, co-founder and tech lead at Vibaura and Gosper.",
        start_url: "/",
        display: "standalone",
        background_color: "#f5f2ec",
        theme_color: "#f5f2ec",
        icons: [
            {
                src: "/icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    };
}
