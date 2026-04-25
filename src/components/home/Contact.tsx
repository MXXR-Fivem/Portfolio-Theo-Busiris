"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useForm } from "@formspree/react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { HiOutlineArrowTopRightOnSquare, HiOutlineEnvelope } from "react-icons/hi2";
import SectionIntro from "@/components/home/SectionIntro";
import { profile } from "@/data/site";

const initialFormState = {
    firstname: "",
    lastname: "",
    email: "",
    message: "",
};

export default function Contact() {
    const [state, handleSubmit] = useForm(process.env.NEXT_PUBLIC_FORM_KEY);
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (state.succeeded) {
            setFormData(initialFormState);
        }
    }, [state.succeeded]);

    function onChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const payload = new FormData();
        payload.append("firstname", formData.firstname);
        payload.append("lastname", formData.lastname);
        payload.append("email", formData.email);
        payload.append("message", formData.message);

        await handleSubmit(payload);
    }

    return (
        <section id="contact" className="section-shell snap-section">
            <div className="section-panel grid gap-3 p-3.5 sm:p-[1.1rem] lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:p-12">
                <div className="space-y-3 lg:space-y-6">
                    <SectionIntro
                        eyebrow="Contact"
                        title="If the work looks relevant, let’s discuss the next product, mission or internship."
                        description="The form stays connected to Formspree. Direct links to email, GitHub, LinkedIn and the CV remain available."
                    />

                    <div className="hidden gap-2 md:grid lg:gap-4">
                        <Link
                            href={`mailto:${profile.email}`}
                            className="flex items-center justify-between rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] px-3 py-2.5 transition hover:border-[var(--identity-border-strong)] lg:px-5 lg:py-4"
                        >
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-cyan-300 lg:h-11 lg:w-11 lg:rounded-2xl">
                                    <HiOutlineEnvelope />
                                </span>
                                <div>
                                    <p className="text-xs text-slate-400 lg:text-sm">Email</p>
                                    <p className="text-sm text-white lg:text-base">{profile.email}</p>
                                </div>
                            </div>
                            <HiOutlineArrowTopRightOnSquare className="text-slate-400" />
                        </Link>

                        <div className="grid gap-2 sm:grid-cols-2 lg:gap-4">
                            <Link
                                href={profile.github}
                                target="_blank"
                                className="rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3.5 transition hover:border-[var(--identity-border-strong)] lg:p-5"
                            >
                                <FaGithub className="text-base text-white lg:text-xl" />
                                <p className="mt-2 text-sm font-semibold text-white lg:mt-4 lg:text-lg">GitHub</p>
                                <p className="mt-1 text-xs text-slate-400 lg:text-sm">
                                    Repositories and project history
                                </p>
                            </Link>
                            <Link
                                href={profile.linkedin}
                                target="_blank"
                                className="rounded-[var(--identity-radius-card)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3.5 transition hover:border-[var(--identity-border-strong)] lg:p-5"
                            >
                                <FaLinkedinIn className="text-base text-white lg:text-xl" />
                                <p className="mt-2 text-sm font-semibold text-white lg:mt-4 lg:text-lg">LinkedIn</p>
                                <p className="mt-1 text-xs text-slate-400 lg:text-sm">
                                    Profile and professional background
                                </p>
                            </Link>
                        </div>

                        {/* <Link
                            href={profile.cv}
                            target="_blank"
                            className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:border-sky-200/40 hover:bg-sky-300/15"
                        >
                            Download CV
                            <HiOutlineArrowTopRightOnSquare />
                        </Link> */}
                    </div>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="flex h-full flex-col rounded-[var(--identity-radius-panel)] border border-[var(--color-line)] bg-[var(--color-card-subtle)] p-3.5 lg:p-6"
                >
                    <div className="grid gap-2 sm:grid-cols-2 lg:gap-4">
                        <label className="space-y-1 lg:space-y-2">
                            <span className="text-xs text-slate-300 lg:text-sm">First name</span>
                            <input
                                type="text"
                                name="firstname"
                                value={formData.firstname}
                                onChange={onChange}
                                required
                                maxLength={30}
                                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/40 lg:rounded-2xl lg:px-4 lg:py-3 lg:text-base"
                            />
                        </label>
                        <label className="space-y-1 lg:space-y-2">
                            <span className="text-xs text-slate-300 lg:text-sm">Last name</span>
                            <input
                                type="text"
                                name="lastname"
                                value={formData.lastname}
                                onChange={onChange}
                                required
                                maxLength={30}
                                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/40 lg:rounded-2xl lg:px-4 lg:py-3 lg:text-base"
                            />
                        </label>
                    </div>

                    <label className="mt-2 block space-y-1 lg:mt-4 lg:space-y-2">
                        <span className="text-xs text-slate-300 lg:text-sm">Email</span>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            required
                            maxLength={60}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/40 lg:rounded-2xl lg:px-4 lg:py-3 lg:text-base"
                        />
                    </label>

                    <label className="mt-2 block space-y-1 lg:mt-4 lg:flex lg:flex-1 lg:flex-col lg:space-y-2">
                        <span className="text-xs text-slate-300 lg:text-sm">Message</span>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={onChange}
                            required
                            rows={7}
                            className="min-h-[6.5rem] w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/40 sm:min-h-[8rem] lg:min-h-[15rem] lg:rounded-3xl lg:px-4 lg:py-3 lg:text-base"
                        />
                    </label>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:mt-auto lg:gap-3">
                        <button
                            type="submit"
                            disabled={state.submitting}
                            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 lg:mt-2 lg:px-5 lg:py-3 lg:text-sm"
                        >
                            {state.submitting ? "Sending..." : "Send message"}
                        </button>

                        <div className="text-xs text-slate-400 mt-2 lg:text-sm">
                            {state.succeeded
                                ? "Message sent successfully."
                                : state.errors
                                  ? "Unable to send the message right now."
                                  : "Responses are handled through Formspree."}
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}
