"use client";

import styles from "./Testimonials.module.css"
import { AiOutlineComment } from "react-icons/ai";

function TestimonialCard({text, author, link}) {
    return (
        <div className={styles.testimonial}>
            <p className={styles.text}>{text}</p>
            <div className={styles.user}>
                <AiOutlineComment className={styles.userIcon}/>
                <h4 className={styles.userName}>
                    - On{" "}
                    <a target="_blank" href={link}>
                        {author}
                    </a>
                </h4>
            </div>
        </div>
  );
}

export default function Testimonials() {
    const testimonials = [
        {
            text: `"A very good script that works very well and is configurable to our liking.
            Very responsive support that knows how to help you. I highly recommend you!"`,
            author: "MXXR shop",
            link: "https://mxxr.tebex.io",
        },
        {
            text: `"I have no complaints about the developer or the scripts, he is very attentive to problems and tries to resolve them quickly!
            Very quick response to all our questions, I recommend!"`,
            author: "MXXR shop",
            link: "https://mxxr.tebex.io",
        },
        {
            text: `"Nothing to say!
            Quality scripts, responsive and competent support.
            Got a question? He'll answer you as quickly as possible and very kindly!"`,
            author: "MXXR shop",
            link: "https://mxxr.tebex.io",
        },
    ];

    return (
        <div className={styles.body}>
            <h2 style={{ alignSelf: "center", margin: "-1vh 0" }}>
                Some Customer Testimonials
            </h2>

            {testimonials.map((testimonal, index) => (
                <TestimonialCard key={index} text={testimonal.text} author={testimonal.author} link={testimonal.link}/>
            ))}
        </div>
    );
}