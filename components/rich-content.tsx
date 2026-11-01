import React from "react";
import { safeURL } from "@/lib/public-config";
import { publicImage } from "@/lib/homepage";
import type { Media } from "@/payload-types";
type Node = { type?: string; text?: string; tag?: string; format?: number; children?: Node[]; fields?: { url?: unknown }; value?: number | Media | null };
export function RichContent({ data }: { data: unknown }) {
  if (!data || typeof data !== "object" || !("root" in data)) return null;
  let visited = 0;
  function render(node: Node, index: number, depth = 0): React.ReactNode {
    if (!node || depth > 24 || ++visited > 4096) return null;
    const children = Array.isArray(node.children) ? node.children.map((child, i) => render(child, i, depth + 1)) : null;
    if (typeof node.text === "string") {
      let text: React.ReactNode = node.text;
      if ((node.format || 0) & 1) text = <strong>{text}</strong>;
      if ((node.format || 0) & 2) text = <em>{text}</em>;
      return <React.Fragment key={index}>{text}</React.Fragment>;
    }
    if (node.type === "heading") { const Heading = (["h2", "h3", "h4"].includes(node.tag || "") ? node.tag : "h2") as "h2" | "h3" | "h4"; return <Heading key={index} className="mb-3 mt-7 text-2xl font-bold">{children}</Heading>; }
    if (node.type === "list") return node.tag === "ol" ? <ol key={index} className="my-5 list-decimal space-y-2 pl-6">{children}</ol> : <ul key={index} className="my-5 list-disc space-y-2 pl-6">{children}</ul>;
    if (node.type === "listitem") return <li key={index}>{children}</li>;
    if (node.type === "linebreak") return <br key={index}/>;
    if (node.type === "link" || node.type === "autolink") { const url = safeURL(node.fields?.url, true); return url ? <a key={index} href={url} className="text-blue-700 underline" rel="noreferrer">{children}</a> : <React.Fragment key={index}>{children}</React.Fragment>; }
    if (node.type === "quote") return <blockquote key={index} className="my-5 border-l-4 border-blue-500 pl-5">{children}</blockquote>;
    // Inline images keep their natural shape so screenshots are never cropped.
    if (node.type === "upload") { const image = publicImage(node.value); const caption = typeof node.value === "object" ? node.value?.caption : null; return image ? <figure key={index} className="my-8"><img src={image.src} srcSet={image.srcSet} sizes="(min-width: 1024px) 896px, 100vw" width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" className="h-auto w-full rounded-2xl border border-slate-200"/>{caption && <figcaption className="mt-3 text-center text-sm text-slate-500">{caption}</figcaption>}</figure> : null; }
    if (node.type === "paragraph") return <p key={index} className="mb-5 leading-8">{children}</p>;
    return <React.Fragment key={index}>{children}</React.Fragment>;
  }
  return <div className="text-slate-700">{render((data as { root: Node }).root, 0)}</div>;
}
