// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AboutContent } from "@/components/about-content";
import { ArticleGrid } from "@/components/article-grid";
import { SocialLinks } from "@/components/social-links";
import { Header } from "@/components/header";
import { socialURL } from "@/lib/public-config";
vi.mock("next/image", () => ({ default: ({ src, preload: _preload, ...props }: { src: string; preload?: boolean }) => <img {...props} src={typeof src === "string" ? src : "logo.jpeg"}/> }));
vi.mock("@/logo.jpeg", () => ({ default: "logo.jpeg" }));
afterEach(cleanup);
describe("About, Blogs and social UI", () => {
  it("provides the requested hero, one meeting button and editable introduction card", () => {
    render(<AboutContent about={{ heroTitle: "Our story", cardHeading: "Who we are", cardContent: { root: { type: "root", version: 1, format: "", indent: 0, direction: null, children: [{ type: "paragraph", version: 1, children: [{ type: "text", text: "Approved company introduction", version: 1 }] }] } } }} bookingURL="https://example.com/book"/>);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Our story");
    expect(screen.getByRole("heading", { name: "Who we are" })).toBeTruthy();
    expect(screen.getByText("Approved company introduction")).toBeTruthy();
    expect(screen.getAllByRole("link",{name:/Schedule a meeting/})).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Schedule a meeting/ }).getAttribute("href")).toBe("https://example.com/book");
  });
  it("falls back to an honest meeting inquiry without unsafe booking URLs", () => {
    render(<AboutContent about={{ meetingURL: "javascript:alert(1)" }} bookingURL=""/>);
    expect(screen.getByRole("link",{name:/Schedule a meeting/}).getAttribute("href")).toBe("/contact?intent=meeting");
    expect(screen.getByText(/Request a meeting through/)).toBeTruthy();
  });
  it("renders any number of article cards in a responsive three-column grid", () => {
    const articles = Array.from({ length: 7 }, (_, i) => ({ id: i, title: `Article ${i}`, slug: `article-${i}`, excerpt: `Summary ${i}` }));
    const { container } = render(<ArticleGrid articles={articles}/>);
    expect(screen.getAllByRole("article")).toHaveLength(7);
    expect(container.firstElementChild?.className).toContain("lg:grid-cols-3");
    expect(screen.getByRole("link", { name: "Read article: Article 6" }).getAttribute("href")).toBe("/blogs/article-6");
  });
  it("renders genuine SVG icons and uses only the CMS-provided links", () => {
    const links = ["facebook", "instagram", "tiktok", "linkedin"].map(platform => ({ platform, label: `Our ${platform}`, url: `https://${platform}.com/vertix-cms-example` }));
    const { container } = render(<SocialLinks links={links}/>);
    expect(container.querySelectorAll("svg")).toHaveLength(4);
    expect(screen.getAllByRole("link").map(node => node.getAttribute("href"))).toEqual(links.map(link => link.url));
    expect(container.textContent).not.toContain("TT");
    expect(socialURL("facebook", "https://another-website.invalid")).toBe("");
  });
  it("does not invent profile links for an empty CMS configuration", () => {
    const { container } = render(<SocialLinks links={[]}/>); expect(container.innerHTML).toBe("");
  });
  it("shows direct About and Blogs links on desktop and mobile without a dropdown", () => {
    const { container } = render(<Header groups={[]} servicesLabel="Services" aboutMenuLabel="About us"/>);
    expect(screen.getByRole("link", { name: "About us" }).getAttribute("href")).toBe("/about");
    expect(screen.getByRole("link", { name: "Blogs" }).getAttribute("href")).toBe("/blogs");
    expect(screen.queryByRole("button", { name: "About us" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const mobile = container.querySelector(".commerce-mobile-nav")!;
    expect(mobile.querySelector('a[href="/about"]')?.textContent).toBe("About us");
    expect(mobile.querySelector('a[href="/blogs"]')?.textContent).toBe("Blogs");
    fireEvent.click(mobile.querySelector('a[href="/blogs"]')!);
    expect(container.querySelector(".commerce-mobile-nav")).toBeNull();
  });
});

describe("Services navigation accessibility",()=>{
  it("keeps a working Services link on desktop and mobile when CMS menus are empty",()=>{
    const { container } = render(<Header groups={[]} servicesLabel="Services"/>);
    expect(screen.getByRole("link",{name:"Services"}).getAttribute("href")).toBe("/services");
    fireEvent.click(screen.getByRole("button",{name:"Open navigation"}));
    const link=container.querySelector('.commerce-mobile-nav a[href="/services"]')!;
    expect(link.textContent).toBe("Services");
    fireEvent.click(link);
    expect(container.querySelector(".commerce-mobile-nav")).toBeNull();
  });
  it("opens by keyboard and closes with Escape, keeping focus on its trigger",()=>{
    render(<Header groups={[{name:"Commerce",slug:"commerce",services:[{slug:"example-service",title:"Example service",text:"Scope",category:"Commerce",categorySlug:"commerce"}]}]} servicesLabel="Services"/>);
    const trigger=screen.getByRole("button",{name:"Services"});
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger,{detail:0});
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link",{name:/Example service/})).toBeTruthy();
    fireEvent.keyDown(trigger,{key:"Escape"});
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("link",{name:/Example service/})).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
