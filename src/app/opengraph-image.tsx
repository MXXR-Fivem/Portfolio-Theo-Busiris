import { ImageResponse } from "next/og";
import { profile } from "@/data/site";

export const alt = "Théo Busiris — Fullstack Developer, Co-founder of Vibaura & Gosper";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The local font files are woff2, which satori (next/og's renderer) can't
// parse — so this pulls the same family as ttf from Google Fonts instead,
// subset to only the glyphs this image actually uses.
async function loadGoogleFont(weight: 400 | 600, text: string) {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Montserrat:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text();
    const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);

    if (!match) {
        throw new Error("Could not resolve a Google Fonts asset URL");
    }

    const response = await fetch(match[1]);
    return response.arrayBuffer();
}

export default async function Image() {
    const text = `${profile.name}${profile.role}${profile.location}Co-founder & Tech Lead · VibauraGosper`;
    const [regular, semibold] = await Promise.all([
        loadGoogleFont(400, text),
        loadGoogleFont(600, text),
    ]);

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "80px",
                    backgroundColor: "#f5f2ec",
                    fontFamily: "Montserrat",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "28px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            padding: "8px 18px",
                            borderRadius: "999px",
                            backgroundColor: "rgba(156, 175, 136, 0.16)",
                            color: "#5f6257",
                            fontSize: 22,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                        }}
                    >
                        {profile.location}
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        fontSize: 84,
                        fontWeight: 600,
                        color: "#2b2e2a",
                        lineHeight: 1.05,
                    }}
                >
                    {profile.name}
                </div>
                <div
                    style={{
                        display: "flex",
                        marginTop: "24px",
                        fontSize: 38,
                        color: "#5f6257",
                        maxWidth: "900px",
                    }}
                >
                    {profile.role}
                </div>
                <div
                    style={{
                        display: "flex",
                        gap: "16px",
                        marginTop: "48px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "14px 28px",
                            borderRadius: "999px",
                            backgroundColor: "#fbfaf6",
                            border: "1px solid rgba(43, 46, 42, 0.1)",
                            color: "#2b2e2a",
                            fontSize: 28,
                        }}
                    >
                        Co-founder & Tech Lead · Vibaura
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "14px 28px",
                            borderRadius: "999px",
                            backgroundColor: "#fbfaf6",
                            border: "1px solid rgba(43, 46, 42, 0.1)",
                            color: "#2b2e2a",
                            fontSize: 28,
                        }}
                    >
                        Gosper
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                { name: "Montserrat", data: regular, weight: 400, style: "normal" },
                { name: "Montserrat", data: semibold, weight: 600, style: "normal" },
            ],
        }
    );
}
