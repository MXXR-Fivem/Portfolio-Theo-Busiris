import localFont from "next/font/local";
import "./globals.css";

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
    colorScheme: "light",
    themeColor: "#f5f2ec",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} ${sourceCodePro.variable}`}>
                {children}
            </body>
        </html>
    );
}
