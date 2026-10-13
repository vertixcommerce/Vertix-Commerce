import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Generated illustrative artwork, not images of real staff or clients.
const source = "C:/Users/rhajr/.codex/generated_images/01a11ccb-dc7a-7b42-8b34-fdbb2446de37";
const files = {
  hero: "exec-819c9f02-cbaa-4db1-8e0e-2062bf1c52b8.png",
  team: "exec-936b43e6-1a73-4aec-b493-8b0c9dfbdaf2.png",
  usa: "exec-16927867-7bd5-423b-bf3a-b15ec9b880e9.png",
  uk: "exec-72614a89-8a17-46c8-b2dc-522067b2fc2f.png",
  australia: "exec-f2a5dff7-2f05-4a9e-99bf-7e07f4ba6e79.png",
  germany: "exec-70a3e80f-5b61-4b26-bdcf-bc1e880bc786.png",
};
await mkdir("public/homepage", { recursive: true });
for (const [name, file] of Object.entries(files)) {
  await sharp(path.join(source, file)).resize({ width: name === "hero" || name === "team" ? 1200 : 640, withoutEnlargement: true }).webp({ quality: 83 }).toFile(`public/homepage/${name}.webp`);
  console.log(`Saved public/homepage/${name}.webp`);
}
