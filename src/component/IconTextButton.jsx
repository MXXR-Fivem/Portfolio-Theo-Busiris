"use client";

import styles from "./IconTextButton.module.css";
import { AiOutlineGithub, AiOutlineLinkedin } from "react-icons/ai";
import { CiMicrophoneOn } from "react-icons/ci";

export default function IconTextButton ({data, onClick}) {
    if (!data) return null;
    return (
        <a style={{"width": "95%", "display": "flex", "justifyContent": "center"}} onClick = {onClick && onClick} href={data.link} target="_blank">
            <button style={{"backgroundColor": data.backgroundColor, "border": data.border}} className={styles.iconTextButton}>
                {data.icon == 1 ? (
                    <AiOutlineLinkedin style={{"color": data.iconColor, "transform": "scale(1.5)"}} className={styles.iconButton}/>
                ) : data.icon == 2 ? (
                    <AiOutlineGithub style={{"color": data.iconColor, "transform": "scale(1.5)"}} className={styles.iconButton}/>
                ) : (
                    <CiMicrophoneOn style={{"color": data.iconColor, "transform": "scale(1.5)"}} className={styles.iconButton}/>
                )}
                <p style={{"color": data.iconColor}}>{data.text}</p>
            </button>
        </a>
    )
}