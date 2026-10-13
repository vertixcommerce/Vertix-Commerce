"use client";
import { FormEvent, useRef, useState } from "react";
type ServiceOption = { slug: string; title: string };
export function LeadForm({ services, initialService = "", initialCountry = "", locale = "en", source = "website", onSubmitted, compact = false }: { services: ServiceOption[]; initialService?: string; initialCountry?: string; locale?: "en" | "de"; source?: "website" | "assistant"; onSubmitted?: () => void; compact?: boolean }) {
  const de = locale === "de";
  const [pending, setPending] = useState(false), [status, setStatus] = useState("");
  const busy = useRef(false), requestId = useRef<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy.current) return;
    const form = event.currentTarget; busy.current = true; setPending(true); setStatus("");
    const fields = new FormData(form); requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(20000), body: JSON.stringify({ ...Object.fromEntries(fields), consent: fields.get("consent") === "on", locale, source, idempotencyKey: requestId.current }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || (de ? "Anfrage konnte nicht gespeichert werden." : "Your inquiry could not be saved."));
      form.reset(); requestId.current = null;
      setStatus(de ? "Vielen Dank. Ihre Anfrage wurde gespeichert. Das Team kann sich bei Verfügbarkeit melden." : "Thank you. Your inquiry was accepted. The team can follow up when available."); onSubmitted?.();
    } catch (error) {
      setStatus(error instanceof Error && error.name !== "TypeError" && error.name !== "TimeoutError" ? error.message : de ? "Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut oder nutzen Sie die Kontaktoptionen." : "Connection failed. Please try again or use the contact options.");
    } finally { busy.current = false; setPending(false); }
  }
  const field = (name: string, label: string, type = "text", maxLength = 100) => <label className="grid gap-2 text-sm font-bold">{label}<input name={name} type={type} required maxLength={maxLength} autoComplete={name === "name" ? "name" : name === "email" ? "email" : "tel"} className="min-w-0 rounded-xl border p-3"/></label>;
  return <form onSubmit={submit} className={compact ? "reference-lead-form grid gap-4" : "grid gap-4"} aria-label={de ? "Kontaktanfrage" : "Contact inquiry"}>
    {field("name", de ? "Vollständiger Name" : "Full name")}{field("email", "Email", "email", 180)}{field("whatsapp", de ? "WhatsApp mit Ländervorwahl" : "WhatsApp with country code", "tel", 30)}
    <label className="grid gap-2 text-sm font-bold">{de ? "Land" : "Country"}<select name="country" required defaultValue={initialCountry} className="min-w-0 rounded-xl border p-3"><option value="">{de ? "Land wählen" : "Choose country"}</option>{["United States", "United Kingdom", "Australia", "Germany"].map(country => <option key={country} value={country}>{de ? ({ "United States": "USA", "United Kingdom": "Vereinigtes Königreich", "Australia": "Australien", "Germany": "Deutschland" } as Record<string, string>)[country] : country}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold">{de ? "Gewünschte Leistung" : "Interested service"}<select name="service" required defaultValue={initialService} className="min-w-0 rounded-xl border p-3"><option value="">{de ? "Leistung wählen" : "Choose service"}</option>{services.map(service => <option key={service.slug} value={service.slug}>{service.title}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold">{de ? "Ihre Anforderungen" : "Project requirements"}<textarea name="requirements" required minLength={10} maxLength={3000} rows={4} className="min-w-0 rounded-xl border p-3"/></label>
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true"/>
    <label className="flex items-start gap-3 text-sm leading-6"><input name="consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0"/><span>{de ? "Ich willige ein, dass Vertix Commerce diese Angaben zur Beantwortung meiner Anfrage verwendet. " : "I consent to Vertix Commerce using these details to respond to my inquiry. "}</span></label>
    <p className="text-xs leading-5 text-slate-500">{de ? "Keine Passwörter, Kartendaten oder geheimen Zugangsdaten eingeben." : "Do not enter passwords, card details, or secret account credentials."}</p>
    <button disabled={pending || !services.length} className="button button-primary disabled:opacity-50">{pending ? (de ? "Wird gesendet…" : "Sending…") : (de ? "Anfrage senden" : "Send inquiry")}</button>
    {status && <p role="status" className="text-sm leading-6">{status}</p>}
  </form>;
}
