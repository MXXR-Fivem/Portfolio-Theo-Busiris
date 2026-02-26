"use client";

import styles from "./Portfolio.module.css"
import { AiOutlineExport } from "react-icons/ai";
import { SiFivem } from "react-icons/si";
import { BiTennisBall } from "react-icons/bi";
import { IoShareSocialOutline } from "react-icons/io5";
import { FaFolderOpen } from "react-icons/fa6";
import { LuTrees } from "react-icons/lu";

export default function () {
    const projects = [
        {
            id: 1,
            icon: <SiFivem style={{"transform":"scale(1.9)", "color":"white"}}/>,
            background: "#ffa600",
            title: "FiveM script store",
            description: "Since 4 years, I have my own FiveM store to sell Lua scripts.\nThere are more than 450 customers and 1600 sells.\n-Shop : Tebex\n-Communication : Youtube / Discord (+1700 members)\n-Scripts : Lua / Ts / SQL",
            tags: ["Scripting", "Own Business", "Support"],
            link: "https://mxxr.tebex.io",
            image: "./mxxrshop.png",
        },
        {
            id: 2,
            icon: <BiTennisBall style={{"transform":"scale(1.9)", "color":"white"}}/>,
            background: "#6cd45a",
            title: "Padel Hub mobile app",
            description: "Padel.hub is a padel-first social web app that centralizes everything players need in one place: A padel-only feed (short posts, clips, links), community features (DMs and groups to organize games), and a booking hub to find courts and coaches.\nIt also includes an activity-style recap (Strava-like) and a knowledge space for rules and simple strategies.\nThe goal is to keep users engaged with focused, high-signal padel content while making it easy to turn scrolling into real sessions on court.",
            tags: ["React Native", "Docker", "Expo"],
            link: "https://github.com/MXXR-Fivem/Padel-hub",
            image: "./padel_hub.png",
        },
        {
            id: 3,
            icon: <LuTrees style={{"transform":"scale(1.9)", "color":"white"}}/>,
            background: "linear-gradient(135deg,rgb(157, 237, 136) 0%,rgb(117, 203, 83) 50%,rgb(43, 173, 54) 100%)",
            title: "Eco-Go — Environmental Action Comparator for Municipalities",
            description: "This project was created for the Data & Climate hackathon (Epitech × The Shifters) ahead of the 2026 municipal elections. Goal: measure, visualize, and compare environmental actions of French municipalities (mobility, energy, sobriety, biodiversity, waste, etc.) using public data, and make them easy to understand for citizens through a clear and accessible interface.",
            tags: ["React Native", "Expo", "Docker"],
            link: "https://github.com/MXXR-Fivem/Hackathon-Data-Climate-TheShifters-Epitech",
            image: "./ecogo.png",
        },
        {
            id: 4,
            icon: <IoShareSocialOutline style={{"transform":"scale(1.9)", "color":"white"}}/>,
            background: "linear-gradient(135deg,rgb(156, 0, 255) 0%,rgb(42, 79, 226) 50%,rgb(0, 255, 255) 100%)",
            title: "To-do list Social Network",
            description: "My first fullstack website, made in 3 weeks as part of a school project. \n- Frontend : Next js with React \n- Backend : Express js \n- Database : Mysql \n- Deployement : VM with Docker configuration",
            tags: ["React / NextJs", "Express Js", "Docker"],
            link: "https://inspir.busiristheo.com/",
            image: "./inspir.png",
            repository: "https://github.com/MXXR-Fivem/Inspir-Social-to-do-list-website",
        },
    ];

    return (
        <div className={styles.body}>
            <h2 style={{"alignSelf":"center"}}>Main Projects</h2>
            {projects.map(project => (
                <div key={project.id} className={styles.box}>

                    <div className={styles.topContainer}>
                        <div className={styles.topLeftContainer}>       
                            <div className={styles.containerTitle}>
                                <div style={{"background": project.background}} className={styles.topBox}>
                                    {project.icon}
                                </div>
                                <h4 className={styles.topTitle}>
                                    {project.title}
                                </h4>
                            </div>             
                            <p className={styles.text}>
                                {project.description.split('\n').map((line, index) => (
                                    <span key={index}>{line}<br/></span>
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
                            <img className={styles.topRightContainerImage} src={project.image} alt={"project screen"}/>
                        </div>
                    </div>
                    
                    <div className={!project.repository ? styles.bottomButtonsSolo : styles.bottomButtonsDuo}>                        
                        <a href={project.link} target="_blank" className={!project.repository ? styles.lowButton : styles.lowButtonDuo}>
                            <AiOutlineExport className={styles.lowIcon}/>
                            <p className={styles.lowButtonText}>Learn More</p>
                        </a>
                        {project.repository &&
                            <a href={project.repository} target="_blank" className={!project.repository ? styles.lowButton : styles.lowButtonDuo}>
                                <FaFolderOpen className={styles.lowIcon}/>
                                <p className={styles.lowButtonText}>Repository</p>
                            </a>
                        }
                    </div>
                </div>
            ))}
        </div>
    )
}