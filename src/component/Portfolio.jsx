"use client";

import styles from "./Portfolio.module.css"
import { AiOutlineHdd, AiOutlineExport } from "react-icons/ai";
import { SiFivem } from "react-icons/si";

export default function () {
    return (
        <div className={styles.body}>
            <h2 style={{"alignSelf":"center"}}>Main Projects</h2>
            <div className={styles.box}>
                <div style={{"background-color": "#3b82f6"}} className={styles.topBox}>
                    <SiFivem style={{"transform":"scale(2)", "color":"white"}}/>
                </div>
                <h4 className={styles.topTitle}>
                    FiveM script store
                </h4>
                <p className={styles.text}>
                    Since 3 years, I have my own FiveM store to sell Lua scripts.
                    There are 450+ customers and 1000+ sells.
                </p>
                <div className={styles.tagContainer}>
                    <div className={styles.tag}>
                        <p className={styles.tagText}>Scripting</p>
                    </div>
                    <div className={styles.tag}>
                        <p className={styles.tagText}>Own Business</p>
                    </div>
                    <div className={styles.tag}>
                        <p className={styles.tagText}>Support</p>
                    </div>
                </div>
                <a href="https://mxxr.tebex.io" target="_blank" className={styles.lowButton}>
                    <AiOutlineExport className={styles.lowIcon}/>
                    <p className={styles.lowButtonText}>Learn More</p>
                </a>
            </div>
        </div>
    )
}