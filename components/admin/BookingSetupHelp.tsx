import { CalendarDays } from "lucide-react";
import { calendlyEventURL } from "@/lib/booking";

export function BookingSetupHelp() {
  const configured = Boolean(calendlyEventURL(process.env.CALENDLY_EVENT_URL?.trim()));
  const hostEmail = process.env.CALENDLY_HOST_EMAIL?.trim();
  return <div className="vx-settings-help"><CalendarDays size={24} aria-hidden="true"/><div>
    <h3>Calendly Free setup</h3>
    <p>{configured ? "Environment event link configured (not a live booking or email-delivery test). It takes priority over the link below." : "Set CALENDLY_EVENT_URL in .env.local, or paste your Calendly event link below. Restart the app after changing environment settings."}</p>
    <ol>
      <li>Use your main business email as your Calendly host account{hostEmail ? ` (expected: ${hostEmail})` : ". Set CALENDLY_HOST_EMAIL to document the expected host email"}.</li>
      <li>Create one free one-on-one event, connect your calendar, and set your real availability.</li>
      <li>Choose Google Meet or another connected video provider as the event location so a meeting link is generated.</li>
      <li>Enable Email confirmations in the event’s Notifications settings. Calendly sends the customer a confirmation and the host a booking notification.</li>
      <li>Make a test booking yourself and verify the date, timezone and join link in both inboxes.</li>
    </ol>
    <p>CALENDLY_HOST_EMAIL does not change Calendly’s account or email recipients. The inquiry notification inbox below is separate. Free bookings use Calendly’s own emails; no API key, Resend key or paid webhook is needed.</p>
    <a href="https://calendly.com/help/calendly-scheduling-notifications" target="_blank" rel="noopener noreferrer">Calendly notification setup</a>
  </div></div>;
}
