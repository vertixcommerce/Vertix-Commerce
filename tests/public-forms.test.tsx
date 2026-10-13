// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LeadForm } from "@/components/lead-form";
import { ContactDock } from "@/components/contact-dock";
import { defaultAssistant, whatsappURL } from "@/lib/public-config";
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const services = [{ slug: "current-service", title: "Current CMS service" }];
function fillLead() {
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Fictional QA" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "qa@example.invalid" } });
  fireEvent.change(screen.getByLabelText("WhatsApp with country code"), { target: { value: "+1 202 555 0100" } });
  fireEvent.change(screen.getByLabelText("Country"), { target: { value: "Germany" } });
  fireEvent.change(screen.getByLabelText("Interested service"), { target: { value: "current-service" } });
  fireEvent.change(screen.getByLabelText("Project requirements"), { target: { value: "Fictional QA requirements." } });
  fireEvent.click(screen.getByRole("checkbox"));
}
describe("public inquiry form", () => {
  it("uses only the provided CMS service list", () => {
    render(<LeadForm services={services}/>);
    expect(screen.getByRole("option", { name: "Current CMS service" })).toBeDefined();
    expect(screen.queryByRole("option", { name: "Shopify Development" })).toBeNull();
  });
  it("handles network failure visibly and preserves fields for retry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    render(<LeadForm services={services}/>); fillLead(); fireEvent.submit(screen.getByRole("form"));
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Connection failed"));
    expect((screen.getByLabelText("Full name") as HTMLInputElement).value).toBe("Fictional QA");
  });
  it("prevents duplicate pending submissions and resets after success", async () => {
    let resolve!: (value: Response) => void;
    const fetch = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) => new Promise<Response>(done => { resolve = done; })); vi.stubGlobal("fetch", fetch);
    render(<LeadForm services={services}/>); fillLead();
    fireEvent.submit(screen.getByRole("form")); fireEvent.submit(screen.getByRole("form"));
    expect(fetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetch.mock.calls[0]?.[1]?.body as string);
    expect(body.consent).toBe(true); expect(body.idempotencyKey).toBeDefined();
    resolve(Response.json({ accepted: true, id: 1 }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("accepted"));
    expect((screen.getByLabelText("Full name") as HTMLInputElement).value).toBe("");
  });
});
describe("assistant GUI", () => {
  it("opens the configured WhatsApp number with the assistant disabled", () => {
    render(<ContactDock config={defaultAssistant} contact={{email:"",whatsapp:"+1 (202) 555-0100",bookingURL:""}}/>);
    const link = screen.getByRole("link", {name:"Message Vertix Commerce on WhatsApp"});
    expect(link.getAttribute("href")).toBe("https://wa.me/12025550100");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.querySelector("svg")).toBeTruthy();
    expect(link.className).toContain("bg-[#075e54]");
    expect(screen.queryByRole("button",{name:"Ask Vertix"})).toBeNull();
  });
  it("separates left email and right WhatsApp and AI launchers", () => {
    render(<ContactDock config={{...defaultAssistant,enabled:true}} contact={{email:"qa@example.invalid",whatsapp:"12025550100",bookingURL:""}}/>);
    const whatsapp = screen.getByRole("link",{name:"Message Vertix Commerce on WhatsApp"});
    const row = whatsapp.parentElement;
    expect(screen.getByRole("link",{name:"Email Vertix Commerce"}).parentElement).not.toBe(row);
    expect(screen.getByRole("link",{name:"Email Vertix Commerce"}).className).toContain("left-3");
    expect(screen.getByRole("button",{name:"Ask Vertix"}).parentElement).toBe(row);
    expect(row?.className).toContain("flex flex-col items-end gap-3");
  });
  it("does not invent or render missing and invalid phone destinations", () => {
    const {container} = render(<ContactDock contact={{email:"",whatsapp:"javascript:alert(1)",bookingURL:""}}/>);
    expect(container.innerHTML).toBe("");
    for(const number of ["", "abc12025550100", "02025550100", "123", "1234567890123456"]) expect(whatsappURL(number)).toBe("");
    expect(whatsappURL("0012025550100")).toBe("https://wa.me/12025550100");
  });
  it("waits for the session handshake, defaults to no storage, and supports German controls", async () => {
    Element.prototype.scrollIntoView = vi.fn();
    const config = { ...defaultAssistant, enabled: true, allowLeadCapture: true };
    const contact = { email: "", whatsapp: "", bookingURL: "" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ config, contact, stored: false, messages: [] })));
    render(<ContactDock config={config} contact={contact} services={services}/>);
    fireEvent.click(screen.getByRole("button", { name: "Ask Vertix" }));
    await waitFor(() => expect((screen.getByRole("button", { name: "Send message" }) as HTMLButtonElement).disabled).toBe(false));
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
    expect(screen.queryByText("Book a meeting")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Deutsch" }));
    expect(screen.getByRole("button", { name: "Nachricht senden" })).toBeDefined();
    expect(screen.getByLabelText("Nachricht")).toBeDefined();
  });
});
