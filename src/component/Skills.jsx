"use client";

import styles from "./Skills.module.css"
import { IoCodeSlash, IoColorPaletteOutline } from "react-icons/io5";
import { BiWorld } from "react-icons/bi";

export default function Skills () {
    return (
        <div className={styles.body}>
            <div className={styles.skills}>
                <div className={styles.title}>
                    <IoCodeSlash style={{"color":"#0f172a"}}className={styles.profileIcon}/>
                    <h3>Technical skills</h3>
                </div>
                <div className={styles.skillsList}>
                    <div style={{"width": "92.75%"}}>
                        <div className={styles.skillsPercentage}>
                            <p className={styles.percentageText}>
                                Lua
                            </p>
                            <p className={styles.percentageText}>
                                82%
                            </p>
                        </div>
                        <div className={styles.parentPercentagebar}>
                            <div style={{"width": "82%", "background-color": "#10b981"}}className={styles.childPercentagebar}/>
                        </div>
                    </div>
                    <div style={{"width": "92.75%"}}>
                        <div className={styles.skillsPercentage}>
                            <p className={styles.percentageText}>
                                SQL
                            </p>
                            <p className={styles.percentageText}>
                                73%
                            </p>
                        </div>
                        <div className={styles.parentPercentagebar}>
                            <div style={{"width": "73%", "background-color": "#10b981"}}className={styles.childPercentagebar}/>
                        </div>
                    </div>
                    <div style={{"width": "92.75%"}}>
                        <div className={styles.skillsPercentage}>
                            <p className={styles.percentageText}>
                                Web
                            </p>
                            <p className={styles.percentageText}>
                                45%
                            </p>
                        </div>
                        <div className={styles.parentPercentagebar}>
                            <div style={{"width": "45%", "background-color": "#f59e0b"}}className={styles.childPercentagebar}/>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.skills}>
                <div className={styles.title}>
                    <IoColorPaletteOutline style={{"color":"#10b981"}}className={styles.profileIcon}/>
                    <h3>Creative skills</h3>
                </div>
                <div className={styles.skillsList}>
                    <div style={{"width": "92.75%"}}>
                        <div className={styles.skillsPercentage}>
                            <p className={styles.percentageText}>
                                Photoshop
                            </p>
                            <p className={styles.percentageText}>
                                50%
                            </p>
                        </div>
                        <div className={styles.parentPercentagebar}>
                            <div style={{"width": "50%", "background-color": "#f59e0b"}}className={styles.childPercentagebar}/>
                        </div>
                    </div>
                    <div style={{"width": "92.75%"}}>
                        <div className={styles.skillsPercentage}>
                            <p className={styles.percentageText}>
                                Première Pro
                            </p>
                            <p className={styles.percentageText}>
                                45%
                            </p>
                        </div>
                        <div className={styles.parentPercentagebar}>
                            <div style={{"width": "45%", "background-color": "#f59e0b"}}className={styles.childPercentagebar}/>
                        </div>
                    </div>
                    <div style={{"width": "92.75%"}}>
                        <div className={styles.skillsPercentage}>
                            <p className={styles.percentageText}>
                                Figma
                            </p>
                            <p className={styles.percentageText}>
                                68%
                            </p>
                        </div>
                        <div className={styles.parentPercentagebar}>
                            <div style={{"width": "68%", "background-color": "#10b981"}}className={styles.childPercentagebar}/>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.skills}>
                <div className={styles.title}>
                    <BiWorld style={{"color":"#3b82f6"}}className={styles.profileIcon}/>
                    <h3>Soft skills</h3>
                </div>
                <div className={styles.skillsList}>
                    <div style={{"width": "92.75%"}}>
                        <div className={styles.skillsPercentage}>
                            <p className={styles.percentageText}>
                                Communication
                            </p>
                            <p className={styles.percentageText}>
                                87%
                            </p>
                        </div>
                        <div className={styles.parentPercentagebar}>
                            <div style={{"width": "87%", "background-color": "#10b981"}}className={styles.childPercentagebar}/>
                        </div>
                    </div>
                    <div style={{"width": "92.75%"}}>
                        <div className={styles.skillsPercentage}>
                            <p className={styles.percentageText}>
                                Team Collaboration
                            </p>
                            <p className={styles.percentageText}>
                                85%
                            </p>
                        </div>
                        <div className={styles.parentPercentagebar}>
                            <div style={{"width": "85%", "background-color": "#10b981"}}className={styles.childPercentagebar}/>
                        </div>
                    </div>
                    <div style={{"width": "92.75%"}}>
                        <div className={styles.skillsPercentage}>
                            <p className={styles.percentageText}>
                                Problem Solving
                            </p>
                            <p className={styles.percentageText}>
                                91%
                            </p>
                        </div>
                        <div className={styles.parentPercentagebar}>
                            <div style={{"width": "91%", "background-color": "#10b981"}}className={styles.childPercentagebar}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}