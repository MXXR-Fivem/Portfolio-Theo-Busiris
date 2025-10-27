"use client";

import styles from "./AboutMe.module.css";
import { CgProfile } from "react-icons/cg";
import { useState } from "react";
import { AiOutlineStar, AiOutlineSchedule, AiOutlinePushpin} from "react-icons/ai";
import { LuCupSoda } from "react-icons/lu";

export default function AboutMe() {
    const [flippedBoxes, setFlippedBoxes] = useState([false, false, false, false]);
    const [hasClicked, setHasClicked] = useState(false);

    const handleClick = () => {
        if (hasClicked) return;
        setHasClicked(true);

        flippedBoxes.forEach((_, index) => {
            setTimeout(() => {
                setFlippedBoxes(prev => {
                    const updated = [...prev];
                    updated[index] = true;
                    return updated;
                });
            }, index * 300);
        });
    };

    const boxContents = [
        {icon: 1, text: "Major Projects", number: "2"},
        {icon: 2, text: "Years experience", number: "3"},
        {icon: 3, text: "Customer satisfaction", number: "94%"},
        {icon: 4, text: "Can of redbull", number: "∞"},
    ];

    const boxColors = ["#0f172a", "#f59e0b", "#3b82f6", "#10b981"];

    return (
        <div className={styles.body}>
            <div className={styles.title}>
                <CgProfile className={styles.profileIcon} />
                <h3>About Me</h3>
            </div>
            <p className={styles.aboutMeParagraph}>
                I have been passionate about computers and development since I was 11 years old,
                and I have always had this curiosity for new technologies.
                <br />
                <br />
                Even today I challenge myself on new projects in order to acquire new skills.
            </p>
            <div className={styles.container}>
                {boxColors.map((color, index) => (
                    <div
                        key={index}
                        className={`${styles.box} ${flippedBoxes[index] ? styles.flipped : ""} ${index === 0 && !hasClicked ? styles.cursorPulse : ""}`}
                        onClick={index === 0 ? handleClick : undefined}
                    >
                        <div className={styles.inner}>
                            <div className={styles.front} style={{backgroundColor:color}}></div>
                            <div className={styles.back} style={{backgroundColor:color}}>
                                {
                                    index == 0 ? (
                                        <AiOutlinePushpin style={{"transform":"scale(1.75)"}}/>
                                    ) : index == 1 ? (
                                        <AiOutlineSchedule style={{"transform":"scale(1.75)"}}/>
                                    ) : index == 2 ? (
                                        <AiOutlineStar style={{"transform":"scale(1.75)"}}/>
                                    ) : <LuCupSoda style={{"transform":"scale(1.75)"}}/>
                                }
                                <p style={index == 3 ? {"transform":"scale(2.25)"} : null}>{boxContents[index].number}</p>
                                <p>{boxContents[index].text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}