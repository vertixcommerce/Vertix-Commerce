import type { CollectionConfig } from "payload";
import { contentEditor, publishedOrAuthenticated } from "../access";
import { seoFields, slugField, statusField } from "../fields";

export const Articles: CollectionConfig = {
  slug: "articles", labels: { singular: "Blog article", plural: "Blog articles" },
  admin: { group: "Website content", useAsTitle: "title", defaultColumns: ["title", "status", "publishedAt", "updatedAt"], listSearchableFields: ["title", "excerpt", "slug"], description: "Add as many articles as needed. Drafts are private; set Publication status to Published and use Publish to show an article on Blogs.", preview: doc => `/blogs/${doc.slug}` },
  defaultSort: "-publishedAt", versions: { drafts: true },
  access: { read: publishedOrAuthenticated, create: contentEditor, update: contentEditor, delete: contentEditor },
  hooks: { beforeChange: [({ data, originalDoc }) => {
    if (data.status === "published" && data._status === "published" && !data.publishedAt && !originalDoc?.publishedAt) data.publishedAt = new Date().toISOString();
    return data;
  }] },
  fields: [
    { name: "title", type: "text", required: true, maxLength: 200 }, statusField,
    { type: "tabs", tabs: [
      { label: "Article content", fields: [
        slugField,
        { name: "excerpt", label: "Card introduction", type: "textarea", required: true, maxLength: 350 },
        { name: "coverImage", label: "Cover image", type: "upload", relationTo: "media", admin: { description: "Optional. Upload a responsive website image or choose from Media library." } },
        { name: "content", label: "Full article", type: "richText", required: true },
      ] },
      { label: "Publication & author", fields: [
        { name: "authorName", label: "Public author name", type: "text", maxLength: 150 },
        { name: "publishedAt", label: "Publication date", type: "date", admin: { date: { pickerAppearance: "dayAndTime" }, description: "Filled on first publication if empty. Sorts newest first; this is a displayed date, not an automatic publishing scheduler." } },
      ] },
      { label: "Search & sharing", fields: [seoFields] },
    ] },
  ],
};
