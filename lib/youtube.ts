import { safeURL } from "./public-config";

export type YouTubeVideo = { id: string; vertical: boolean };
// Accepts watch, youtu.be, Shorts and embed links; anything else is rejected rather than embedded.
export function youtubeVideo(value: unknown): YouTubeVideo | null {
  const href = safeURL(value);
  if (!href) return null;
  const url = new URL(href), host = url.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null, vertical = false;
  if (host === "youtu.be") id = url.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [kind, segment] = url.pathname.split("/").filter(Boolean);
    if (kind === "watch") id = url.searchParams.get("v");
    else if (kind === "shorts" || kind === "embed" || kind === "live") { id = segment ?? null; vertical = kind === "shorts"; }
  }
  return id && /^[\w-]{11}$/.test(id) ? { id, vertical } : null;
}
