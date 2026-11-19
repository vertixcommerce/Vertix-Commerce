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

describe("rich content tables and lists",()=>{
  it("renders Lexical table cells as an accessible HTML table",()=>{
    const tableDoc = { root: { children: [{ type: "table", children: [
      { type: "tablerow", children: [
        { type: "tablecell", headerState: 1, children: [{ type: "paragraph", children: [{ text: "Factor" }] }] },
        { type: "tablecell", headerState: 1, children: [{ type: "paragraph", children: [{ text: "eBay" }] }] },
      ] },
      { type: "tablerow", children: [
        { type: "tablecell", headerState: 0, children: [{ type: "paragraph", children: [{ text: "Marketplace scale" }] }] },
        { type: "tablecell", headerState: 0, children: [{ type: "paragraph", children: [{ text: "$79.6bn GMV" }] }] },
      ] },
    ] }] } };
    render(<RichContent data={tableDoc}/>);
    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Factor" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "$79.6bn GMV" })).toBeTruthy();
  });

  it("marks list items for compact spacing and removes nested paragraph margins",()=>{
    const listDoc = { root: { children: [{ type: "list", tag: "ul", children: [
      { type: "listitem", children: [{ type: "paragraph", children: [{ text: "First point" }] }] },
      { type: "listitem", children: [{ type: "paragraph", children: [{ text: "Second point" }] }] },
    ] }] } };
    const { container } = render(<RichContent data={listDoc}/>);
    expect(container.querySelector("ul")?.className).toContain("space-y-1");
    expect(container.querySelector("li")?.className).toContain("blog-list-item");
  });
});
