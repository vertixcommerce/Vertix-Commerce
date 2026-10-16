import { notFound } from "next/navigation";
import { getSiteChrome } from "@/lib/site-content";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("Privacy Notice", "Read the privacy notice for Vertix Commerce website inquiries and business services.", "/privacy");
export default async function PolicyPage() { const chrome = await getSiteChrome(); if (!chrome.privacyApproved || !chrome.privacyText) notFound(); return <main className="section"><article className="container max-w-3xl"><p className="eyebrow">Vertix Commerce</p><h1 className="my-5 text-4xl font-black">Privacy Notice</h1><div className="whitespace-pre-line leading-8 text-slate-700">{chrome.privacyText}</div></article></main>; }
