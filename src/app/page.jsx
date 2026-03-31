"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Header from "@/components/Header";
import Interview from "@/components/Interview";
import AboutMe from "@/components/AboutMe";
import Form from "@/components/Form";
import Testimonials from "@/components/Testimonials";
import Skills from "@/components/Skills";
import Portfolio from "@/components/portfolio/Portfolio";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";

export default function Home() {
    const [showInterview, setShowInterview] = useState(false);

    return (
        <div className={styles.bodyDiv}>
            <header className={styles.header}>
                <Header onClick={() => setShowInterview(true)}/>
            </header>
            <main className={styles.main}>
                {showInterview && (
                    <Interview onClick={() => setShowInterview(false)}/>
                )}
                <AboutMe/>
                <Portfolio/>
                <Testimonials/>
                <Skills/>
                <Form/>
            </main>
            <Analytics/>
            <SpeedInsights/>
        </div>
    );
}