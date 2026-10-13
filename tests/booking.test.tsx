// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { calendlyEventURL, configuredBookingURL, meetingHref } from "@/lib/booking";
import { MeetingBooking } from "@/components/meeting-booking";
afterEach(cleanup);
const event = "https://calendly.com/qa-only/consultation";
describe("Calendly Free booking", () => {
  it("accepts event links and removes any prefilled personal data", () => {
    expect(calendlyEventURL(event + "?email=private@example.invalid#secret")).toBe(event);
    expect(calendlyEventURL("https://www.calendly.com/qa-only/consultation/")).toBe(event);
  });
  it("rejects unsafe and non-event iframe destinations", () => {
    for (const url of ["javascript:alert(1)", "http://calendly.com/qa-only/event", "https://calendly.com.evil.invalid/qa-only/event", "https://evil.calendly.com/qa-only/event", "https://user:pass@calendly.com/qa-only/event", "https://calendly.com", "https://calendly.com/qa-only", "https://calendly.com:444/qa-only/event"]) expect(calendlyEventURL(url)).toBe("");
  });
  it("honors environment override, CMS and legacy fallback, and fails closed", () => {
    expect(configuredBookingURL("https://example.invalid/book", {CALENDLY_EVENT_URL:event})).toBe(event);
    expect(configuredBookingURL(event, {})).toBe(event);
    expect(configuredBookingURL(undefined, {NEXT_PUBLIC_BOOKING_URL:event})).toBe(event);
    expect(configuredBookingURL(event, {CALENDLY_EVENT_URL:"https://evil.invalid/embed"})).toBe("");
  });
  it("routes Calendly to the meeting page and preserves other legitimate destinations", () => {
    expect(meetingHref(event)).toBe("/meeting");
    expect(meetingHref("https://example.invalid/book")).toBe("https://example.invalid/book");
    expect(meetingHref("/contact")).toBe("/contact");
    expect(meetingHref("javascript:alert(1)")).toBe("/contact?intent=meeting");
  });
  it("loads the scheduling calendar immediately without a second click", () => {
    const {container} = render(<MeetingBooking bookingURL={event}/>);
    expect(container.querySelector("iframe")).toBeTruthy();
    expect(screen.queryByRole("button", {name:"Load Calendly scheduler"})).toBeNull();
    expect(screen.getByTitle("Book a meeting with Vertix through Calendly").getAttribute("src")).toBe(event);
    expect(container.textContent).not.toContain("Meeting confirmed!");
    fireEvent.load(screen.getByTitle("Book a meeting with Vertix through Calendly"));
    expect(screen.queryByRole("status")).toBeNull();
  });
  it("keeps external fallback available for failed or blocked embeds", () => {
    render(<MeetingBooking bookingURL={event}/>);
    const link = screen.getByRole("link", {name:/Open Calendly directly/});
    expect(link.getAttribute("href")).toBe(event);
    expect(link.getAttribute("target")).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("Loading calendar");
  });
  it("shows an honest missing-configuration fallback without an iframe", () => {
    const {container} = render(<MeetingBooking bookingURL=""/>);
    expect(screen.getByText(/no time is reserved automatically/)).toBeTruthy();
    expect(screen.getByRole("link", {name:"Request a meeting"}).getAttribute("href")).toBe("/contact?intent=meeting");
    expect(container.querySelector("iframe")).toBeNull();
  });
  it("never embeds non-Calendly links", () => {
    render(<MeetingBooking bookingURL="https://example.invalid/book"/>);
    expect(screen.queryByRole("button", {name:"Load Calendly scheduler"})).toBeNull();
    expect(screen.getByRole("link", {name:/Open booking calendar/}).getAttribute("href")).toBe("https://example.invalid/book");
    expect(screen.getByRole("link", {name:/Open booking calendar/}).getAttribute("target")).toBeNull();
  });
});


