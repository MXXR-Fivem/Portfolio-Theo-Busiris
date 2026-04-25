"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Interview from "@/components/Interview";

export default function HeroSection() {
    const [showInterview, setShowInterview] = useState(false);

    return (
        <>
            <Header onClick={() => setShowInterview(true)} />
            {showInterview && (
                <Interview onClick={() => setShowInterview(false)} />
            )}
        </>
    );
}
