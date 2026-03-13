import styles from "./RoundedText.module.css";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineLocalPhone } from "react-icons/md";
import { MdMailOutline } from "react-icons/md";

export default function RoundedText ({data}) {
    if (!data) return null;
    return (
        <div className={styles.roundedText}>
            {data.icon == 1 ? (
                <IoLocationOutline className={styles.icon}/>
            ) : data.icon == 2 ? (
                <MdOutlineLocalPhone className={styles.icon}/>
            ) : data.icon == 3 ? (
                <MdMailOutline className={styles.icon}/>
            ) : null}
            <p>{data.text}</p>
        </div>
    )
}