"use client";

import styles from "./Header.module.css";
import RoundedText from "@/component/RoundedText";
import IconTextButton from "@/component/IconTextButton";

export default function Home({onClick}) {
    const title = "First-year student at Epitech";

    return (
        <div className={styles.header}>
            <img className={styles.photo} src="./cv.jpeg" alt="photo" />
            <h1>BUSIRIS THÉO</h1>
            <h3 className={styles.title}>
                {[...title].map((char, index) => (
                <span
                    key={index}
                    className={styles.letter}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    {char}
                </span>
                ))}
            </h3>
            <h4>
                Bringing passion, news, profesionalism to every project.
            </h4>
            <div className={styles.roundedTexts}>
                <RoundedText data={{icon: 2, text: "LinkedIn & Mail"}}/>
                <RoundedText data={{icon: 3, text: "contact@busiristheo.com"}}/>
                <RoundedText data={{icon: 1, text: "Paris, France"}}/>
            </div>
            <div className={styles.iconTextButtons}>
                <IconTextButton data={{icon: 1, text: "LinkedIn", iconColor: "white", backgroundColor: "#0A66C2", border: "none", link: "https://linkedin.com/in/theobusiris"}}/>
                <IconTextButton data={{icon: 2, text: "Github", iconColor: "black", backgroundColor: "white", border: "1px solid black", link: "https://github.com/MXXR-Fivem"}}/>
                <IconTextButton data={{icon: 3, text: "Interview", iconColor: "white", backgroundColor: "#0f172a", border: "none"}} onClick={onClick}/>
            </div>
        </div>
    );
}