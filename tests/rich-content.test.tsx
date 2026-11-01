// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { RichContent } from "@/components/rich-content";
import type { Media } from "@/payload-types";

afterEach(cleanup);
const media = { id: 7, alt: "eBay support confirming defect removal", caption: "eBay support chat", filename: "chat.png", width: 760, height: 700, updatedAt: "2026-11-02T00:00:00.000Z", createdAt: "2026-11-02T00:00:00.000Z" } as Media;
const doc = (value: unknown) => ({ root: { children: [{ type: "paragraph", children: [{ text: "Before" }] }, { type: "upload", relationTo: "media", value }] } });
describe("rich content images",()=>{
  it("renders populated inline images uncropped with their caption",()=>{
    render(<RichContent data={doc(media)}/>);
    const image = screen.getByAltText("eBay support confirming defect removal");
    expect(image.getAttribute("width")).toBe("760");
    expect(image.getAttribute("src")).toContain("chat.png");
    expect(screen.getByText("eBay support chat")).toBeTruthy();
  });
  it("skips images that were not populated",()=>{
    const {container}=render(<RichContent data={doc(7)}/>);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Before")).toBeTruthy();
  });
});
