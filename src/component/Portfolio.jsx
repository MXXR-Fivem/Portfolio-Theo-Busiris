"use client";

import styles from "./Portfolio.module.css"
import { AiOutlineExport } from "react-icons/ai";
import { SiFivem } from "react-icons/si";
import { IoShareSocialOutline } from "react-icons/io5";

export default function () {
    return (
        <div className={styles.body}>
            <h2 style={{"alignSelf":"center"}}>Main Projects</h2>
            <div className={styles.box}>
                <div style={{"backgroundColor": "#3b82f6"}} className={styles.topBox}>
                    <SiFivem style={{"transform":"scale(2)", "color":"white"}}/>
                </div>
                <h4 className={styles.topTitle}>
                    FiveM script store
                </h4>
                <p className={styles.text}>
                    Since 4 years, I have my own FiveM store to sell Lua scripts.
                    <br/>
                    There are more than 450 customers and 1600 sells.
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
            <div className={styles.box}>
                <div style={{"background": "linear-gradient(135deg,rgb(156, 0, 255) 0%,rgb(42, 79, 226) 50%,rgb(0, 255, 255) 100%)"}} className={styles.topBox}>
                    <IoShareSocialOutline style={{"transform":"scale(2)", "color":"white"}}/>
                </div>
                <h4 className={styles.topTitle}>
                    To-do list Social Network
                </h4>
                <p className={styles.text}>
                    My first fullstack website, made in 3 weeks as part of a school project. <br/>
                    - Frontend : Next js with React <br/>
                    - Backend : Express js <br/>
                    - Database : Mysql <br/>
                    - Deployement : VM with Docker configuration
                </p>
                <div className={styles.tagContainer}>
                    <div className={styles.tag}>
                        <p className={styles.tagText}>Frontend</p>
                    </div>
                    <div className={styles.tag}>
                        <p className={styles.tagText}>Backend</p>
                    </div>
                    <div className={styles.tag}>
                        <p className={styles.tagText}>DevOps</p>
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