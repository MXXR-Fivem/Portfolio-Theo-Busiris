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
                            <p className={styles.percentageText}>{skill.percent}</p>
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
                {name: "Lua", percent: 82},
                {name: "SQL", percent: 73},
                {name: "Web", percent: 45},
            ],
        },
        {
            icon: <IoColorPaletteOutline />,
            color: "#10b981",
            title: "Creative skills",
            skills: [
                {name: "Photoshop", percent: 51},
                {name: "Première Pro", percent: 45},
                {name: "Figma", percent: 68},
            ],
        },
        {
            icon: <BiWorld />,
            color: "#3b82f6",
            title: "Soft skills",
            skills: [
                {name: "Communication", percent: 87},
                {name: "Team Collaboration", percent: 85},
                {name: "Problem Solving", percent: 91},
            ],
        },
    ];

    return (
        <>
            <h2 style={{"textAlign": "center", "margin": "-1.5vh 0 -3.5vh 0"}}>
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
                ))};
            </div>
        </>
    )
}