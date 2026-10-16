import { pageMetadata } from "@/lib/page-metadata";
import { getSiteChrome } from "@/lib/site-content";
import { MeetingBooking } from "@/components/meeting-booking";

export const metadata = pageMetadata("Schedule a Meeting", "Book a meeting with Vertix Commerce to discuss your store, marketplace priorities and support needs. Choose an available time in your timezone.", "/meeting");
export default async function MeetingPage() {
  const chrome = await getSiteChrome();
  return <main className="section bg-blue-50"><div className="container max-w-5xl">
    <p className="eyebrow">Let’s discuss</p><h1 className="mb-5 mt-4 text-4xl font-black md:text-5xl">Schedule a meeting with Vertix</h1>
    <p className="mb-8 max-w-2xl leading-7 text-slate-600">Tell us about your business and the support you need. Please do not share account passwords, payment card details or secret keys.</p>
    <MeetingBooking bookingURL={chrome.contact.bookingURL}/>
  </div></main>;
}
