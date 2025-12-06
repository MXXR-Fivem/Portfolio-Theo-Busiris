"use client";

import styles from "./Interview.module.css";

export default function Home({onClick}) {
    return (
        <div className={styles.overlay} onClick={onClick}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClick} aria-label="Fermer">
                    ✕
                </button>
                <div className={styles.videoWrapper}>
                <video autoPlay loop controls className={styles.videoInModal}>
                    <source src="./interview.mp4" type="video/mp4" />
                </video>
                </div>
            </div>
        </div>
    );
}