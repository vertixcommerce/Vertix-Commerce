# Calendly Free + client reviews

## Add reviews

Admin → Settings → Website settings → **Homepage sections** → **Client reviews**.

Click **Add Client review**, enter the public client name and genuine quote, optionally add country, portrait and rating. Check **Permission obtained and review approved** only with permission to publish. Save changes. Drag rows to reorder or delete to remove. Unapproved rows stay hidden. The **Show review section** checkbox hides the section; headings are editable too.

These cards render in the screenshot-style homepage. Select that layout under Brand & homepage. Other homepage sections moved into Homepage sections → Other homepage sections. Existing field paths and saved content are unchanged; this UI change does not migrate/delete reviews.

## Configure the environment

Fill these existing blank entries in `.env.local` (and your hosting provider's environment settings for production):

```dotenv
CALENDLY_EVENT_URL=https://calendly.com/YOUR-ACCOUNT/YOUR-EVENT
CALENDLY_HOST_EMAIL=YOUR-MAIN-BUSINESS-EMAIL
```

The example is not an actual Vertix booking link. Restart Next.js after changing environment settings.

`CALENDLY_EVENT_URL` takes priority over Website settings → Contact & booking → Meeting booking link, then the legacy NEXT_PUBLIC_BOOKING_URL. An invalid explicit Calendly environment URL disables booking rather than embedding an arbitrary host. Use a public account/event URL, not an admin link or API token. The iframe URL drops query parameters/fragments, including prefilled personal data.

`CALENDLY_HOST_EMAIL` is a server-only, admin-visible expected host email. **It does not change the Calendly account or its recipients.** Do not put a password/API token here. The website's inquiry notification inbox remains separate from Calendly booking notifications.

## Required Calendly account setup

1. Create/sign in to Calendly using the **main business email** that should receive bookings. Choose Free (not paid-only trial features).
2. Create the Free plan's one one-on-one event. Set your actual duration, availability, timezone and buffers. Connect your calendar so conflicts are respected.
3. Connect Google Calendar/Google Meet (or another supported video provider). Select the provider under your event's Location. Calendly generates a meeting-specific join link only when a video provider is connected and selected before booking.
4. Open Notifications and automations and choose **Email confirmations** for the invitee. Calendly also sends the host a separate default booking notification. Verify the host account's primary email is the business inbox you want. If that address differs, change it in Calendly or configure forwarding in your email provider; setting it in `.env.local` cannot forward emails.
5. Copy the event's public scheduling link into CALENDLY_EVENT_URL.
6. Make one test booking using an email you control. Check both inboxes for the correct date, timezone and video join link; cancel the test through Calendly afterward. Test again while on the actual Free plan after any trial expires.

## Website behavior and limits

Calendly meeting buttons lead to `/meeting`. The scheduling calendar loads automatically in the same tab, without an additional load button. If embedding is blocked, the fallback opens Calendly directly in the same tab. This website does not claim a meeting is booked merely because a frame loads, and it does not send confirmations from client-side events.

Bookings, rescheduling, cancellations, timezones and emails are handled by Calendly. Free supports confirmation emails and website embedding. Custom real-time webhooks and automated reminders/workflows require a paid plan; no paid webhook, custom booking-email endpoint or duplicate Resend email has been added. No Calendly API key or Resend key is needed for native booking confirmations. Update your business-reviewed privacy notice to describe Calendly as a booking provider.

No external account was created/modified and no real meeting or confirmation email was sent during development. Live availability, the account's plan and email delivery require the test above.

Official references checked October 10, 2026:

- [Plans](https://calendly.com/pricing)
- [Scheduling notifications](https://calendly.com/help/calendly-scheduling-notifications)
- [Video conferencing and join links](https://calendly.com/help/how-to-schedule-with-video-conferencing)
- [Iframe embedding](https://calendly.com/help/how-to-embed-calendly-with-an-iframe)
- [Webhook plans](https://calendly.com/help/webhooks-overview)

