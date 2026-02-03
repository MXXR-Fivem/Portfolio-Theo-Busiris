"use client";

import styles from "./Form.module.css";
import React, { useState, useEffect } from 'react';
import { AiOutlineEdit } from "react-icons/ai";
import { useForm, ValidationError } from '@formspree/react';

export default function Form () {
    const [state, handleSubmit] = useForm(process.env.NEXT_PUBLIC_FORM_KEY);
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        reason: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const dataSend = new FormData();
        dataSend.append('firstname', formData.firstname);
        dataSend.append('lastname', formData.lastname);
        dataSend.append('email', formData.email);
        dataSend.append('phone', formData.phone);
        dataSend.append('reason', formData.reason);
        try {
            await handleSubmit(dataSend);
        } catch (err) {
            console.error("handleSubmit error", err);
        }
    };

    useEffect(() => {
        if (state.succeeded) {
            setFormData({
                firstname: "",
                lastname: "",
                email: "",
                phone: "",
                reason: "",
            });
            alert('Formulaire envoyé avec succès');
        }
    }, [state.succeeded, state.errors]);

    return (
        <div className={styles.body}>
            <div className={styles.title}>
                <AiOutlineEdit className={styles.profileIcon}/>
                <h3>Contact Me</h3>
            </div>
            <form onSubmit={onSubmit} className={styles.form}>

                <div className={styles.formContent}>
                    <label className={styles.label} htmlFor="firstname">
                        Firstname :
                    </label>
                    <input
                        type="text"
                        name="firstname"
                        id="firstname"
                        maxLength="20"
                        value={formData.firstname}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formContent}>
                    <label className={styles.label} htmlFor="lastname">
                        Lastname :
                    </label>
                    <input
                        type="text"
                        name="lastname"
                        id="lastname"
                        maxLength="20"
                        value={formData.lastname}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formContent}>
                    <label className={styles.label} htmlFor="email">
                        Email :
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        maxLength="25"
                        autoComplete="on"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>

                {/* <div className={styles.formContent}>
                    <label className={styles.label} htmlFor="phone">
                        Phone number :
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        maxLength="20"
                        id="phone"
                        autoComplete="on"
                        value={formData.phone}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div> */}

                <div className={styles.formContent}>
                    <label className={styles.label} htmlFor="reason">
                        Reason of the contact :
                    </label>
                    <textarea
                        name="reason"
                        id="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className={styles.input}
                        rows="4"
                        required
                    />
                </div>

                <button type="submit" disabled={state.submitting} className={styles.button}>Envoyer</button>
            </form>
        </div>
    )

}
