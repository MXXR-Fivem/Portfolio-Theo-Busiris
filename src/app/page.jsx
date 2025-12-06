"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Header from "@/component/Header";
import Interview from "@/component/Interview";
import AboutMe from "@/component/AboutMe";
import Form from "@/component/Form";
import Testimonials from "@/component/Testimonials";
import Skills from "@/component/Skills";
import Portfolio from "@/component/Portfolio";
import {Analytics} from "@vercel/analytics/next"
import {SpeedInsights} from "@vercel/speed-insights/next"

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