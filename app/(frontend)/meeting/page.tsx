import type { Metadata } from "next";
import { getSiteChrome } from "@/lib/site-content";
import { MeetingBooking } from "@/components/meeting-booking";

export const metadata: Metadata = { title: "Schedule a meeting", description: "Choose a meeting time to discuss your commerce requirements with Vertix." };
export default async function MeetingPage() {
  const chrome = await getSiteChrome();
  return <main className="section bg-blue-50"><div className="container max-w-5xl">
    <p className="eyebrow">Let’s discuss</p><h1 className="mb-5 mt-4 text-4xl font-black md:text-5xl">Schedule a meeting with Vertix</h1>
    <p className="mb-8 max-w-2xl leading-7 text-slate-600">Tell us about your business and the support you need. Please do not share account passwords, payment card details or secret keys.</p>
    <MeetingBooking bookingURL={chrome.contact.bookingURL}/>
  </div></main>;
}
