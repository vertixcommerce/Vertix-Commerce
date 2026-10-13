import type { Media, WebsiteSetting } from "@/payload-types";

export type HomepageSettings = Pick<WebsiteSetting, "businessName" | "heroEnabled" | "heroEyebrow" | "heroLayout" | "heroImageSide" | "heroTheme" | "heroMedia" | "heroButtons" | "homepageLayoutMode" | "homepageSections" | "referenceHomepage">;
export type HomepageSection = NonNullable<WebsiteSetting["homepageSections"]>[number];
export type ImageSettings = NonNullable<WebsiteSetting["heroMedia"]>;
// Use Payload's access-checked file route for both local files and private S3 buckets.
export function mediaPath(filename: unknown): string {
  return typeof filename === "string" && filename && !/[\\/\u0000-\u001f]/.test(filename) ? `/api/media/file/${encodeURIComponent(filename)}` : "";
}
export function publicImage(value: number | Media | null | undefined) {
  if (!value || typeof value !== "object") return null;
  const src = mediaPath(value.filename);
  if (!src || !value.width || !value.height) return null;
  const variants = [value.sizes?.mobile, value.sizes?.tablet, value.sizes?.desktop, value]
    .filter((size): size is NonNullable<typeof size> => Boolean(size?.filename && size.width))
    .map(size => ({ src: mediaPath(size.filename), width: size.width! }))
    .filter(size => size.src);
  const unique = [...new Map(variants.map(size => [size.width, size])).values()].sort((a, b) => a.width - b.width);
  return { src, srcSet: unique.map(size => `${size.src} ${size.width}w`).join(", "), alt: value.alt || "", width: value.width, height: value.height, focalX: value.focalX ?? 50, focalY: value.focalY ?? 50 };
}
export function visibleHomepageSections(homepage: Partial<HomepageSettings>) {
  return (homepage.homepageSections || []).filter(section => section.enabled !== false);
}
export function homepageHasFAQs(homepage: Partial<HomepageSettings>, count: number) {
  if (homepage.homepageLayoutMode === "reference") return count > 0 && homepage.referenceHomepage?.faqEnabled !== false;
  return count > 0 && (homepage.homepageLayoutMode !== "custom" || visibleHomepageSections(homepage).some(section => section.blockType === "faqs"));
}
