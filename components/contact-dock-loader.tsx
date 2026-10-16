"use client";
import dynamic from "next/dynamic";
import { Mail } from "lucide-react";
import { whatsappURL, type AssistantConfig, type ContactConfig } from "@/lib/public-config";

const AssistantDock = dynamic(() => import("./contact-dock").then(module => module.ContactDock), { ssr: false });
// Ordinary visitors only need contact links, not the chat UI and its form code.
export function ContactDockLoader({ config, contact, services }: { config: AssistantConfig; contact: ContactConfig; services: { slug: string; title: string }[] }) {
  if (config.enabled) return <AssistantDock config={config} contact={contact} services={services}/>;
  const whatsapp = whatsappURL(contact.whatsapp);
  return <div className="fixed bottom-4 right-3 z-50 flex flex-col items-end gap-3 sm:right-6">
    {contact.email && <a aria-label="Email Vertix Commerce" title="Email us" href={"mailto:" + contact.email + "?subject=Vertix%20Commerce%20inquiry"} className="grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-white text-[#082840] shadow-lg hover:bg-blue-50"><Mail size={22}/></a>}
    {whatsapp && <a aria-label="Message Vertix Commerce on WhatsApp" title="Chat with us on WhatsApp" href={whatsapp} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 place-items-center rounded-full bg-[#075e54] text-white shadow-md hover:bg-[#064d44]"><svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .1 5.4.1 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6a12 12 0 0 0 5.8 1.5h.1c6.6 0 12-5.4 12-12a12 12 0 0 0-3.6-8.4ZM12.1 22a10 10 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.3-.4a10 10 0 0 1-1.5-5.3C2.1 6.5 6.6 2 12.1 2s10 4.5 10 10-4.5 10-10 10Zm5.5-7.5c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.2.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.8-.7 2-1.3.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.4Z"/></svg></a>}
  </div>;
}
