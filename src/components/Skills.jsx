"use client";

import styles from "./Skills.module.css"
import { IoCodeSlash, IoColorPaletteOutline } from "react-icons/io5";
import { BiWorld } from "react-icons/bi";

function SkillCard({icon, color, title, skills}) {
    return (
        <div className={styles.skills}>
            <div className={styles.title}>
                {icon && (
                    <span style={{color}} className={styles.profileIcon}>
                        {icon}
                    </span>
                )}
                <h3>{title}</h3>
            </div>

            <div className={styles.skillsList}>
                {skills.map((skill, index) => (
                    <div key={index} style={{"width":"92.75%"}}>
                        <div className={styles.skillsPercentage}>
                            <p className={styles.percentageText}>{skill.name}</p>
                            <p className={styles.percentageText}>{skill.percent}%</p>
                        </div>
                        <div className={styles.parentPercentagebar}>
                            <div
                                style={{
                                    "width": `${skill.percent}%`,
                                    "backgroundColor": skill.percent >= 70 ? "#10b981" : "#f59e0b",
                                }}
                                className={styles.childPercentagebar}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function Skills () {
    const skillCategories = [
        {
            icon: <IoCodeSlash />,
            color: "#0f172a",
            title: "Technical skills",
            skills: [
                {name: "Rust", percent: 35},
                {name: "Web (NextJs / React) & TypeScript", percent: 80},
                {name: "Mobile (React Native / Expo)", percent: 72},
                {name: "Python", percent: 75},
                {name: "Lua", percent: 81},
            ],
        },
        {
            icon: <BiWorld />,
            color: "#3b82f6",
            title: "Project management",
            skills: [
                {name: "Communication", percent: 87},
                {name: "Team Collaboration", percent: 85},
                {name: "Problem Solving", percent: 91},
                {name: "Notion", percent: 72},
                {name: "Git", percent: 70},
            ],
        },
        {
            icon: <IoColorPaletteOutline />,
            color: "#10b981",
            title: "Creative skills",
            skills: [
                {name: "Figma", percent: 80},
                {name: "Photoshop", percent: 60},
                {name: "Première Pro", percent: 55},
            ],
        },
    ];

    return (
        <>
            <h2 style={{"textAlign": "center", "margin": "0 0 -3.5vh 0"}}>
                Skills & Expertise
            </h2>
            <div className={styles.body}>
                {skillCategories.map((category, index) => (
                    <SkillCard
                        key={index}
                        icon={category.icon}
                        color={category.color}
                        title={category.title}
                        skills={category.skills}
                    />
                ))}
            </div>
        </>
    )
}