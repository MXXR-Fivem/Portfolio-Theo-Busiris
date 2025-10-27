"use client";

import styles from "./Testimonials.module.css"
import { AiOutlineComment } from "react-icons/ai";

export default function Testimonials () {
    return (
        <div className={styles.body}>
            <h2 style={{"alignSelf":"center", "margin":"-1.25vh 0"}}>Some Customer Testimonials</h2>
            <div className={styles.testimonial}>
                <p className={styles.text}>
                    "A very good script that works very well and is configurable to our liking.
                    Very responsive support that knows how to help you. I highly recommend you!"
                </p>
                <div className={styles.user}>
                    <AiOutlineComment className={styles.userIcon}/>
                    <h4 className={styles.userName}>- On <a target="_blank" href="https://mxxr.tebex.io">MXXR shop</a></h4>
                </div>
            </div>
            <div className={styles.testimonial}>
                <p className={styles.text}>
                    "I have no complaints about the developer or the scripts, he is very attentive to problems and tries to resolve them quickly!
                    <br />
                    Very quick response to all our questions, I recommend!"
                </p>
                <div className={styles.user}>
                    <AiOutlineComment className={styles.userIcon}/>
                    <h4 className={styles.userName}>- On <a target="_blank" href="https://mxxr.tebex.io">MXXR shop</a></h4>
                </div>
            </div>
            <div className={styles.testimonial}>
                <p className={styles.text}>
                    "Nothing to say!
                    <br />
                    Quality scripts, responsive and competent support.
                    <br />
                    Got a question? He'll answer you as quickly as possible and very kindly!"
                </p>
                <div className={styles.user}>
                    <AiOutlineComment className={styles.userIcon}/>
                    <h4 className={styles.userName}>- On <a target="_blank" href="https://mxxr.tebex.io">MXXR shop</a></h4>
                </div>
            </div>
        </div>
    )
}