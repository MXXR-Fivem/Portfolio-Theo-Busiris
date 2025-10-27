"use client";

import styles from "./components.module.css";
import { AiOutlineGithub, AiOutlineLinkedin } from "react-icons/ai";

export default function IconTextButton ({data}) {
    if (!data) return null;
    return (
        <a style={{"width": "95%", "display": "flex", "justifyContent": "center"}} href={data.link} target="_blank">
            <button style={{"backgroundColor": data.backgroundColor, "border": "1px solid black"}} className={styles.iconTextButton}>
                {data.icon == 1 ? (
                    <AiOutlineLinkedin style={{"color": data.iconColor, "transform": "scale(1.4)"}} className={styles.iconButton}/>
                ) : (
                    <AiOutlineGithub style={{"color": data.iconColor, "transform": "scale(1.4)"}} className={styles.iconButton}/>
                )}
                <p style={{"color": data.icon == 1 ? "white" : "black"}}>{data.text}</p>
            </button>
        </a>
    )

}
