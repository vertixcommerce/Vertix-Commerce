import { describe, expect, it } from "vitest";
import { FALLBACK_DE, FALLBACK_EN, looksSensitive, redactMessage } from "@/lib/chat";
describe("assistant safety", () => {
  it("does not promise a booking link without configuration", () => {
    expect(FALLBACK_EN).toContain("Let's Discuss");
    expect(FALLBACK_EN).not.toContain("meeting link");
    expect(FALLBACK_DE).toContain("Kontaktformular");
  });
  it.each(["Here is my eBay password", "Mein Passwort", "My card number", "My API key", "My OTP is private"])("detects sensitive credentials: %s", message => expect(looksSensitive(message)).toBe(true));
  it("does not flag ordinary words as credentials", () => expect(looksSensitive("Help optimize my store")).toBe(false));
  it("redacts email and phone details from chat storage", () => {
    expect(redactMessage("Reach me at qa@example.invalid and +1 202 555 0100")).not.toContain("qa@example.invalid");
    expect(redactMessage("My password is secret")).toBe("[Sensitive content removed]");
  });
});
