"use client";

import { useEffect, useState } from "react";
import styles from "./Portfolio.module.css";
import { AiOutlineExport } from "react-icons/ai";
import { FaFolderOpen } from "react-icons/fa6";
import { PROJECTS_INITIAL, type Project } from "./project_data";

type TebexStats = {
    totalSales: number;
    totalCustomers: number;
};

function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US").format(value);
}

function buildFiveMDescription(stats?: TebexStats) {
    const totalCustomers = stats ? formatNumber(stats.totalCustomers) : "450";
    const totalSales = stats ? formatNumber(stats.totalSales) : "1,600";

    return [
        "Since 4 years, I have my own FiveM store to sell Lua scripts.",
        `There are more than ${totalCustomers} customers and ${totalSales} sells. (updated)`,
        "-Shop : Tebex",
        "-Communication : Youtube / Discord (+1700 members)",
        "-Scripts : Lua / Ts / SQL",
    ].join("\n");
}

function withLiveStats(projects: Project[], stats?: TebexStats): Project[] {
    return projects.map((project) => {
        if (project.id !== 1) {
            return project;
        }

        return {
            ...project,
            description: buildFiveMDescription(stats),
        };
    });
}

export default function Portfolio() {
    const [projects, setProjects] = useState<Project[]>(
        withLiveStats(PROJECTS_INITIAL)
    );

    useEffect(() => {
        let cancelled = false;

        async function loadTebexStats() {
            try {
                const response = await fetch("/api/tebex/stats", {
                    method: "GET",
                    cache: "no-store",
                });

                if (!response.ok) {
                    return;
                }

                const stats: TebexStats = await response.json();

                if (cancelled) {
                    return;
                }

                setProjects(withLiveStats(PROJECTS_INITIAL, stats));
            } catch {}
        }

        loadTebexStats();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className={styles.body}>
        <h2 style={{ alignSelf: "center" }}>Main Projects</h2>

        {projects.map((project) => (
            <div key={project.id} className={styles.box}>
                <div className={styles.topContainer}>
                    <div className={styles.topLeftContainer}>
                    <div className={styles.containerTitle}>
                        <div
                        style={{ background: project.background }}
                        className={styles.topBox}
                        >
                            {project.icon}
                        </div>

                        <h4 className={styles.topTitle}>{project.title}</h4>
                    </div>

                    <p className={styles.text}>
                        {project.description.split("\n").map((line, index) => (
                        <span key={index}>
                            {line}
                            <br />
                        </span>
                        ))}
                    </p>

                    <div className={styles.tagContainer}>
                        {project.tags.map((tag, index) => (
                        <div key={index} className={styles.tag}>
                            <p className={styles.tagText}>{tag}</p>
                        </div>
                        ))}
                    </div>
                    </div>

                    <div className={styles.topRightContainer}>
                    <img
                        className={styles.topRightContainerImage}
                        src={project.image}
                        alt={`${project.title} preview`}
                    />
                    </div>
                </div>

                <div
                    className={
                    !project.repository
                        ? styles.bottomButtonsSolo
                        : styles.bottomButtonsDuo
                    }
                >
                    <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className={
                        !project.repository ? styles.lowButton : styles.lowButtonDuo
                    }
                    >
                        <AiOutlineExport className={styles.lowIcon} />
                        <p className={styles.lowButtonText}>Learn More</p>
                    </a>

                    {project.repository && (
                    <a
                        href={project.repository}
                        target="_blank"
                        rel="noreferrer"
                        className={
                        !project.repository ? styles.lowButton : styles.lowButtonDuo
                        }
                    >
                        <FaFolderOpen className={styles.lowIcon} />
                        <p className={styles.lowButtonText}>Repository</p>
                    </a>
                    )}
                </div>
            </div>
        ))}
        </div>
    );
}