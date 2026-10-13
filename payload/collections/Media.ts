import type { CollectionConfig } from "payload";
import path from "node:path";
import { contentEditor } from "../access";

export const Media: CollectionConfig = {
  slug: "media", labels: { singular: "Website image", plural: "Media library" },
  admin: { group: "Website content", useAsTitle: "alt", defaultColumns: ["filename", "alt", "updatedAt"], description: "Public website images only. Do not upload customer documents or personal information. JPEG, PNG, WebP and AVIF up to 4 MB." },
  access: { read: () => true, create: contentEditor, update: contentEditor, delete: contentEditor },
  upload: {
    staticDir: path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    adminThumbnail: "mobile", focalPoint: true,
    resizeOptions: { width: 2560, height: 2560, fit: "inside", withoutEnlargement: true },
    formatOptions: { format: "webp", options: { quality: 85 } },
    imageSizes: [
      { name: "mobile", width: 640, withoutEnlargement: true },
      { name: "tablet", width: 960, withoutEnlargement: true },
      { name: "desktop", width: 1600, withoutEnlargement: true },
    ],
  },
  hooks: { beforeOperation: [({ operation, req }) => {
    if ((operation === "create" || operation === "update") && req.file && req.file.size > 4 * 1024 * 1024) throw new Error("Please upload an image smaller than 4 MB.");
  }] },
  fields: [
    { name: "alt", label: "Image description (accessibility)", type: "text", required: true, maxLength: 300 },
    { name: "caption", type: "text", maxLength: 500 },
  ],
};
