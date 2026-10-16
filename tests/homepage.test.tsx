// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
vi.mock("@payload-config", () => ({ default: {} }));
import { HomepageBody, HomepageHero, ResponsiveCMSImage } from "@/components/homepage-sections";
import { defaultChrome } from "@/lib/site-content";
import { mediaPath, publicImage, homepageHasFAQs } from "@/lib/homepage";
import { Media } from "@/payload/collections/Media";
import type { Media as MediaDoc } from "@/payload-types";

const image: MediaDoc = { id: 1, alt: "Example website image", filename: "example.webp", width: 1800, height: 1200, focalX: 30, focalY: 40, createdAt: "", updatedAt: "", sizes: { mobile: { filename: "example-640.webp", width: 640 }, tablet: { filename: "example-960.webp", width: 960 }, desktop: { filename: "example-1600.webp", width: 1600 } } };
afterEach(cleanup);
describe("manual homepage builder", () => {
  it("renders saved section order, repeats and hidden controls", () => {
    const chrome = { ...defaultChrome, homepage: { businessName: "Vertix", homepageLayoutMode: "custom" as const, homepageSections: [
      { blockType: "cta" as const, sectionName: "First", heading: "First section" },
      { blockType: "text" as const, sectionName: "Hidden", heading: "Hidden section", enabled: false },
      { blockType: "cta" as const, sectionName: "Second", heading: "Second section" },
    ] } };
    render(<HomepageBody chrome={chrome}/>);
    expect(screen.getAllByRole("heading").map(node => node.textContent)).toEqual(["First section", "Second section"]);
    expect(screen.queryByText("Hidden section")).toBeNull();
  });
  it("does not restore standard sections when a custom layout is intentionally empty", () => {
    const { container } = render(<HomepageBody chrome={{ ...defaultChrome, homepage: { businessName: "Vertix", homepageLayoutMode: "custom", homepageSections: [] } }}/>);
    expect(container.innerHTML).toBe("");
  });
  it("keeps standard content as the safe existing-layout default", () => {
    render(<HomepageBody chrome={defaultChrome}/>);
    expect(screen.getByRole("heading", { name: "Let's discuss your business" })).toBeTruthy();
  });
  it("lets an admin hide the hero without losing its content", () => {
    const { container } = render(<HomepageHero chrome={{ ...defaultChrome, homepage: { businessName: "Vertix", heroEnabled: false } }}/>);
    expect(container.innerHTML).toBe("");
  });
  it("adapts image variants and crops independently for mobile and desktop", () => {
    const { container } = render(<ResponsiveCMSImage settings={{ image, mobileImage: { ...image, filename: "mobile.webp" }, imageFit: "contain", imageRatio: "landscape", mobileImageRatio: "portrait", imagePositionX: 75 }}/>);
    const picture = container.querySelector("picture")!;
    expect(picture.style.getPropertyValue("--mobile-image-ratio")).toBe("4 / 5");
    expect(picture.style.getPropertyValue("--image-position")).toBe("75% 40%");
    expect(container.querySelector("source")?.getAttribute("media")).toBe("(max-width: 767px)");
    expect(screen.getByAltText("Example website image").getAttribute("srcset")).toContain("example-640.webp 640w");
    expect((screen.getByAltText("Example website image") as HTMLImageElement).style.objectFit).toBe("contain");
  });
  it("falls back from unresolved or deleted images and rejects traversal paths", () => {
    expect(publicImage(42)).toBeNull();
    expect(mediaPath("../secret")).toBe("");
    expect(mediaPath("folder\\secret")).toBe("");
    expect(mediaPath("my image.webp")).toBe("/api/media/file/my%20image.webp");
    const { container } = render(<ResponsiveCMSImage settings={{ image: 42 }}/>);
    expect(container.innerHTML).toBe("");
  });
  it("omits unsafe links and respects FAQ header visibility", () => {
    render(<HomepageBody chrome={{ ...defaultChrome, homepage: { businessName: "Vertix", homepageLayoutMode: "custom", homepageSections: [{ blockType: "cta", sectionName: "Test", buttons: [{ label: "Unsafe", url: "javascript:alert(1)" }, { label: "Contact", url: "/contact" }] }] } }}/>);
    expect(screen.queryByRole("link", { name: "Unsafe" })).toBeNull();
    expect(screen.getByRole("link", { name: /Contact/ }).getAttribute("href")).toBe("/contact");
    expect(homepageHasFAQs({ homepageLayoutMode: "custom", homepageSections: [{ blockType: "faqs", sectionName: "FAQs", enabled: false }] }, 1)).toBe(false);
    expect(homepageHasFAQs({ homepageLayoutMode: "standard" }, 1)).toBe(true);
  });
  it("restricts uploads to editors and safe image formats", async () => {
    expect(await Media.access!.create!({ req: { user: null } } as never)).toBe(false);
    expect(await Media.access!.create!({ req: { user: { roles: ["editor"] } } } as never)).toBe(true);
    expect(Media.upload && typeof Media.upload === "object" && Media.upload.mimeTypes).not.toContain("image/svg+xml");
    expect(() => Media.hooks!.beforeOperation![0]({ operation: "create", req: { file: { size: 5 * 1024 * 1024 } } } as never)).toThrow("4 MB");
  });
});


it("changes every responsive media URL when an image is updated",()=>{const first=publicImage({...image,updatedAt:"2026-10-16T10:00:00Z"})!;const next=publicImage({...image,updatedAt:"2026-10-16T11:00:00Z"})!;expect(first.src).not.toBe(next.src);expect(first.srcSet).not.toBe(next.srcSet);expect(next.srcSet.split(", ").every(item=>item.includes("?v="))).toBe(true);});
