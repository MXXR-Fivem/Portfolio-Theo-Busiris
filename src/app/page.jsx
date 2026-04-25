import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Stats from "@/components/home/Stats";
import Projects from "@/components/home/Projects";
import Skills from "@/components/home/Skills";
import Testimonials from "@/components/home/Testimonials";
import Ambitions from "@/components/home/Ambitions";
import Contact from "@/components/home/Contact";
import SectionScrollController from "@/components/home/SectionScrollController";

export default function Home() {
    return (
        <>
            <div className="site-backdrop relative min-h-screen overflow-hidden text-white">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
                <SectionScrollController />
                <Navbar />
                <main className="relative z-10 pb-12">
                    <Hero />
                    <About />
                    <Stats />
                    <Projects />
                    <Skills />
                    <Testimonials />
                    <Ambitions />
                    <Contact />
                </main>
            </div>
            <Analytics />
            <SpeedInsights />
        </>
    );
}
