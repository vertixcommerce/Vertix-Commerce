import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import type { SocialLink } from "@/lib/site-content";

export function SocialIcon({ platform }: { platform: string }) {
  const icons = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube };
  const Icon = icons[platform as keyof typeof icons];
  if (Icon) return <Icon size={19} aria-hidden="true"/>;
  if (platform === "x") return <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-7.4L5.5 22H2.4l7.9-9L1.7 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L7.3 4H5.5L17.8 20Z"/></svg>;
  if (platform === "tiktok") return <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 2c.3 2.2 1.6 3.6 3.8 3.9v3.6a8.2 8.2 0 0 1-3.8-1.1v7.2a6.4 6.4 0 1 1-5.5-6.3V13a2.8 2.8 0 1 0 1.9 2.6V2h3.6Z"/></svg>;
  return null;
}
export function SocialLinks({ links }: { links: SocialLink[] }) {
  if (!links.length) return null;
  return <nav aria-label="Follow Vertix on social media" className="flex flex-wrap gap-3">{links.map(link => <a key={`${link.platform}-${link.url}`} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label} title={link.label} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-[#0867e8] transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"><SocialIcon platform={link.platform}/></a>)}</nav>;
}
