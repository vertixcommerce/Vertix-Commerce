"use client";
import { useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { calendlyEventURL } from "@/lib/booking";
import { safeURL } from "@/lib/public-config";

export function MeetingBooking({ bookingURL }: { bookingURL: string }) {
  const [loadedURL, setLoadedURL] = useState("");
  const eventURL = calendlyEventURL(bookingURL);
  const external = eventURL || safeURL(bookingURL);
  if (!external) return <section className="card p-6 md:p-9" aria-labelledby="booking-heading">
    <CalendarDays size={32} className="text-blue-700" aria-hidden="true"/>
    <h2 id="booking-heading" className="mb-4 mt-4 text-2xl font-black">Request a meeting</h2>
    <p className="leading-7 text-slate-600">Online meeting booking is not configured yet. Send a meeting request to the team; no time is reserved automatically.</p>
    <a className="button button-primary mt-6" href="/contact?intent=meeting">Request a meeting</a>
  </section>;
  if (!eventURL) return <section className="card p-6 md:p-9" aria-labelledby="booking-heading">
    <h2 id="booking-heading" className="mb-4 text-2xl font-black">Choose your meeting time</h2>
    <a className="button button-primary" href={external} referrerPolicy="no-referrer">Open booking calendar<ArrowRight size={16}/></a>
  </section>;
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-label="Meeting scheduling calendar">
    {loadedURL !== eventURL && <p role="status" className="px-6 pt-5 text-sm text-slate-600">Loading calendar…</p>}
    <iframe key={eventURL} src={eventURL} title="Book a meeting with Vertix through Calendly" className="block w-full border-0 bg-white" style={{height:820}} referrerPolicy="no-referrer" onLoad={() => setLoadedURL(eventURL)}/>
    <div className="border-t border-slate-100 px-6 py-4 text-xs leading-6 text-slate-500">
      <p>Calendar unavailable? <a href={eventURL} referrerPolicy="no-referrer" className="font-semibold text-blue-700 underline">Open Calendly directly</a> or <a href="/contact?intent=meeting" className="text-blue-700 underline">request help</a>.</p>
      <p>Calendly processes your booking under its <a href="https://calendly.com/legal/privacy-notice" className="underline">privacy notice</a>. Check your timezone and Calendly’s confirmation after scheduling.</p>
    </div>
  </section>;
}
