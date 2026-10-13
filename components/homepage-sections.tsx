import { ArrowRight, BarChart3, Globe2, Search, Store } from "lucide-react";
import type { CSSProperties } from "react";
import type { SiteChrome } from "@/lib/site-content";
import type { HomepageSection, ImageSettings } from "@/lib/homepage";
import { publicImage, visibleHomepageSections } from "@/lib/homepage";
import { safeURL } from "@/lib/public-config";
import { meetingHref } from "@/lib/booking";
import { RichContent } from "./rich-content";

const themes = { white: "bg-white text-slate-950", blue: "bg-blue-50 text-slate-950", navy: "homepage-navy bg-[#071a38] text-white" };
const ratios = { landscape: "16 / 9", square: "1 / 1", portrait: "4 / 5" };
type Button = { label: string; url: string };
function Buttons({ buttons }: { buttons?: Button[] | null }) {
  return <div className="mt-8 flex flex-wrap gap-3">{(buttons || []).flatMap((button, i) => {
    const safe = safeURL(button.url, true);
    const href = safe ? meetingHref(safe) : "";
    return href && button.label ? [<a key={i} href={href} className={"button " + (i === 0 ? "button-primary" : "button-secondary")}>{button.label}<ArrowRight size={18}/></a>] : [];
  })}</div>;
}
export function ResponsiveCMSImage({ settings, hero = false, sizes = "(min-width: 1024px) 45vw, 100vw" }: { settings: ImageSettings; hero?: boolean; sizes?: string }) {
  const desktop = publicImage(settings.image) || publicImage(settings.mobileImage);
  const mobile = publicImage(settings.mobileImage) || desktop;
  if (!desktop || !mobile) return null;
  const clamp = (value: number | null | undefined, fallback: number) => typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : fallback;
  const position = (image: typeof desktop) => `${clamp(settings.imagePositionX, image.focalX)}% ${clamp(settings.imagePositionY, image.focalY)}%`;
  const style = {
    "--image-ratio": ratios[settings.imageRatio || "landscape"],
    "--mobile-image-ratio": ratios[settings.mobileImageRatio || "square"],
    "--image-position": position(desktop), "--mobile-image-position": position(mobile),
  } as CSSProperties;
  return <picture className="cms-picture block w-full overflow-hidden rounded-3xl bg-slate-100" style={style}>
    <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes="100vw"/>
    <img src={desktop.src} srcSet={desktop.srcSet} sizes={sizes} width={desktop.width} height={desktop.height} alt={desktop.alt} loading={hero ? "eager" : "lazy"} fetchPriority={hero ? "high" : "auto"} decoding="async" className="cms-image block h-full w-full" style={{ objectFit: settings.imageFit === "contain" ? "contain" : "cover" }}/>
  </picture>;
}
function DefaultHeroArt() {
  return <div className="overflow-hidden rounded-3xl border border-slate-200 bg-[#071a38] p-7 text-white shadow-sm"><p className="text-sm font-bold text-blue-300">A clearer conversation</p><h2 className="mt-3 text-3xl font-black">Your priorities, organized.</h2><div className="mt-8 grid gap-4 sm:grid-cols-2">{[[Store, "Your business"], [Globe2, "Your market"], [Search, "Your requirements"], [BarChart3, "Your goals"]].map(([Icon, label]) => { const I = Icon as typeof Store; return <div key={label as string} className="rounded-2xl border border-white/15 bg-white/10 p-5"><I className="text-blue-300"/><p className="mt-8 font-bold">{label as string}</p></div>; })}</div></div>;
}
export function HomepageHero({ chrome }: { chrome: SiteChrome }) {
  const home = chrome.homepage;
  if (home.heroEnabled === false) return null;
  const centered = home.heroLayout === "centered";
  const media = home.heroMedia || {};
  const imageExists = publicImage(media.image) || publicImage(media.mobileImage);
  const defaults = [{ label: "Let's discuss", url: "/contact" }, ...(chrome.contact.bookingURL ? [{ label: "Schedule a meeting", url: chrome.contact.bookingURL }] : [])];
  return <section className={"overflow-hidden py-16 md:py-24 " + themes[home.heroTheme || "blue"]}>
    <div className={"container grid items-center gap-10 " + (centered ? "text-center" : "lg:grid-cols-[1.1fr_.9fr]")}>
      <div className={centered ? "mx-auto max-w-4xl [&>div]:justify-center" : ""}>
        {home.heroEyebrow !== "" && <p className="eyebrow">{home.heroEyebrow ?? home.businessName}</p>}
        <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl xl:text-7xl">{chrome.heroTitle}</h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">{chrome.heroIntroduction}</p>
        <Buttons buttons={home.heroButtons?.length ? home.heroButtons : defaults}/>
        <p className="mt-5 text-xs text-slate-500">Never send passwords, card details, or secret keys through forms or chat.</p>
      </div>
      <div className={(!centered && home.heroImageSide === "left" ? "lg:order-first " : "") + (centered ? "mx-auto w-full max-w-5xl" : "min-w-0")}>
        {imageExists ? <ResponsiveCMSImage settings={media} hero sizes={centered ? "(min-width: 1280px) 1024px, 100vw" : undefined}/> : !centered ? <DefaultHeroArt/> : null}
      </div>
    </div>
  </section>;
}
function SectionContent({ section, chrome }: { section: HomepageSection; chrome: SiteChrome }) {
  switch (section.blockType) {
    case "services": {
      const services = section.serviceSource === "all" ? chrome.services : chrome.featuredServices;
      return <div className="mt-9 grid gap-5 md:grid-cols-2">{services.map(service => <article key={service.slug} className="card bg-white p-7 text-slate-950 transition hover:-translate-y-1 hover:border-blue-300"><p className="text-xs font-bold uppercase tracking-wide text-blue-600">{service.category}</p><h3 className="mt-3 text-2xl font-black">{service.title}</h3><p className="mt-3 leading-7 text-slate-600">{service.text}</p><a href={"/services/" + service.slug} className="mt-6 inline-flex items-center gap-2 font-bold text-blue-600">Explore service<ArrowRight size={18}/></a></article>)}</div>;
    }
    case "text": return <div className="mt-6 max-w-4xl"><RichContent data={section.body}/></div>;
    case "imageText": return <div className="mt-8 grid items-center gap-9 lg:grid-cols-2"><div><RichContent data={section.body}/><Buttons buttons={section.buttons}/></div><div className={section.imageSide === "left" ? "lg:order-first" : ""}><ResponsiveCMSImage settings={section}/></div></div>;
    case "features": return <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{(section.cards || []).map((card, i) => <article key={card.id || i} className="card bg-white p-7 text-slate-950"><h3 className="text-xl font-bold">{card.title}</h3><p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{card.description}</p>{safeURL(card.url, true) && <a href={safeURL(card.url, true)} className="mt-5 inline-flex items-center gap-2 font-bold text-blue-700">Learn more<ArrowRight size={16}/></a>}</article>)}</div>;
    case "gallery": return <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{(section.images || []).map((item, i) => <figure key={item.id || i}><ResponsiveCMSImage settings={{ image: item.image, imageFit: "cover", imageRatio: "square", mobileImageRatio: "square" }} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"/>{item.caption && <figcaption className="mt-3 text-sm">{item.caption}</figcaption>}</figure>)}</div>;
    case "faqs": return <div className="mt-8 space-y-3">{chrome.faqs.map((faq, i) => <details key={i} className="card bg-white p-6 text-slate-950"><summary className="cursor-pointer font-bold">{faq.question}</summary><p className="mt-4 whitespace-pre-line leading-7 text-slate-600">{faq.answer}</p></details>)}</div>;
    case "markets": return <div className="mt-8 grid gap-5 sm:grid-cols-2">{chrome.countries.map(country => <a className="card bg-white p-6 text-slate-950" key={country.slug} href={"/contact?country=" + encodeURIComponent(country.name)}><Globe2 className="text-blue-600"/><h3 className="mt-4 text-xl font-bold">{country.name}</h3><p className="mt-2 text-slate-600">{country.introduction}</p></a>)}</div>;
    case "cta": return <><p className="mt-5 max-w-3xl whitespace-pre-line leading-8">{section.description}</p><Buttons buttons={section.buttons}/></>;
  }
}
export function HomepageBody({ chrome }: { chrome: SiteChrome }) {
  const sections: HomepageSection[] = chrome.homepage.homepageLayoutMode === "custom" ? visibleHomepageSections(chrome.homepage) : [
    ...(chrome.featuredServices.length ? [{ blockType: "services" as const, sectionName: "Services", eyebrow: chrome.expertiseEyebrow, heading: chrome.expertiseTitle }] : []),
    ...(chrome.countries.length ? [{ blockType: "markets" as const, sectionName: "Markets", theme: "blue" as const, eyebrow: "Markets", heading: "Country-specific information" }] : []),
    ...(chrome.faqs.length ? [{ blockType: "faqs" as const, sectionName: "FAQs", theme: "blue" as const, eyebrow: "FAQs", heading: "Your questions, answered" }] : []),
    { blockType: "cta", sectionName: "Contact", theme: "navy", heading: "Let's discuss your business", description: "Share your requirements in a consented inquiry. Scope, timing, and commercial terms need confirmation by the team.", buttons: [{ label: "Start the conversation", url: "/contact" }] },
  ];
  const anchored = new Set<string>();
  return <>{sections.map((section, i) => {
    // Avoid empty published-data sections and duplicate anchor IDs when blocks are reused.
    if (section.blockType === "faqs" && !chrome.faqs.length || section.blockType === "markets" && !chrome.countries.length || section.blockType === "services" && !(section.serviceSource === "all" ? chrome.services : chrome.featuredServices).length) return null;
    const anchor = ["services", "faqs", "markets"].includes(section.blockType) && !anchored.has(section.blockType) ? (section.blockType === "markets" ? "countries" : section.blockType) : undefined;
    anchored.add(section.blockType);
    const spacing = section.spacing === "compact" ? "py-10" : section.spacing === "spacious" ? "py-20 md:py-28" : "py-14 md:py-20";
    return <section id={anchor} key={section.id || i} className={spacing + " " + themes[section.theme || "white"]}><div className="container">{section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}{section.heading && <h2 className="mt-3 text-3xl font-black md:text-5xl">{section.heading}</h2>}<SectionContent section={section} chrome={chrome}/></div></section>;
  })}</>;
}
