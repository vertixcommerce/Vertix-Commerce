import { notFound } from "next/navigation";
import { getSiteChrome } from "@/lib/site-content";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata = pageMetadata("Service Terms", "Read the service terms for Vertix Commerce website inquiries and business services.", "/terms");
export default async function PolicyPage() { const chrome = await getSiteChrome(); if (!chrome.termsApproved || !chrome.termsText) notFound(); return <main className="section"><article className="container max-w-3xl"><p className="eyebrow">Vertix Commerce</p><h1 className="my-5 text-4xl font-black">Service Terms</h1><div className="whitespace-pre-line leading-8 text-slate-700">{chrome.termsText}</div></article></main>; }
