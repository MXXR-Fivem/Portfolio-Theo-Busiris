import localFont from "next/font/local";
import "./globals.css";

const montserrat = localFont({
    variable: "--font-heading",
    src: [
        {
            path: "./fonts/Montserrat-Regular.otf",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/Montserrat-Medium.otf",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/Montserrat-SemiBold.otf",
            weight: "600",
            style: "normal",
        },
        {
            path: "./fonts/Montserrat-Bold.otf",
            weight: "700",
            style: "normal",
        },
    ],
});

const sourceCodePro = localFont({
    variable: "--font-code",
    src: [
        {
            path: "./fonts/SourceCodePro-Regular.otf",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/SourceCodePro-Medium.otf",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/SourceCodePro-Bold.otf",
            weight: "700",
            style: "normal",
        },
    ],
});

export const metadata = {
    title: "Théo Busiris | Fullstack & Mobile Developer",
    description:
        "Portfolio of Théo Busiris, Epitech Paris student building fullstack, mobile and backend products with a strong product mindset.",
    metadataBase: new URL("https://www.busiristheo.com"),
    openGraph: {
        title: "Théo Busiris | Fullstack & Mobile Developer",
        description:
            "Fullstack, mobile and backend developer at Epitech Paris. Projects, skills, live business stats and contact.",
        url: "https://www.busiristheo.com",
        siteName: "Théo Busiris Portfolio",
        locale: "en_US",
        type: "website",
    },
};

export const viewport = {
    colorScheme: "dark",
    themeColor: "#061116",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${montserrat.variable} ${sourceCodePro.variable}`}>
                {children}
            </body>
        </html>
    );
}
