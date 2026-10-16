import Link from "next/link";
import { ArrowRight, Check, Compass, Globe2, Layers, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import type { AboutPage } from "@/payload-types";
import { publicImage } from "@/lib/homepage";
import { safeURL } from "@/lib/public-config";
import { meetingHref } from "@/lib/booking";
import { ResponsiveCMSImage } from "./homepage-sections";
import { RichContent } from "./rich-content";
import { CountryFlag } from "./country-flag";

import { ServiceHeroVisual } from "./service-hero-visual";

type Market = { slug: string; name: string; introduction: string };
const icons = [Compass, Layers, ShieldCheck, MessageCircle];
const knownMarkets = new Set(["usa", "uk", "australia", "germany"]);
function Heading({ eyebrow, title, introduction }: { eyebrow: string; title: string; introduction?: string | null }) {
  return <div className="about-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{introduction && <p>{introduction}</p>}</div>;
}
export function AboutContent({ about, bookingURL, markets = [] }: { about: Partial<AboutPage>; bookingURL: string; markets?: Market[] }) {
  const booking = safeURL(about.meetingURL) || safeURL(bookingURL);
  const media = about.heroMedia || {};
  const hasImage = publicImage(media.image) || publicImage(media.mobileImage);
  const team = (about.teamMembers || []).filter(member => member.approved === true);
  return <main className="about-page">
    <section className="about-hero"><div className="container about-hero-grid">
      <div><p className="eyebrow">{about.heroEyebrow ?? "Vertix Commerce"}</p><h1>{about.heroTitle || "About Vertix"}<span className="about-heading-line" aria-hidden="true"/></h1>{about.heroIntroduction && <p className="about-hero-intro">{about.heroIntroduction}</p>}
        <Link prefetch={false} href={meetingHref(booking)} className="button button-primary">{about.meetingButtonLabel || "Schedule a meeting"}<ArrowRight size={18}/></Link>
        {!booking && <p className="about-booking-note">Request a meeting through our contact form. The team will confirm the arrangements.</p>}
      </div>
      <div className="about-hero-art">{hasImage ? <ResponsiveCMSImage settings={media} hero/> : <ServiceHeroVisual/>}</div>
    </div></section>
    <section className="about-section" id="our-story"><div className="container about-story-grid">
      <article className="about-story"><p className="eyebrow">Our introduction</p><h2>{about.cardHeading || "Who we are"}</h2>{about.cardContent ? <RichContent data={about.cardContent}/> : <p className="about-copy">Company information has not been published yet.</p>}</article>
      {(about.focusHeading || about.focusItems?.length) && <aside className="about-focus-card"><span className="about-icon"><Compass size={26}/></span><h3>{about.focusHeading || "Our focus"}</h3>{about.focusIntroduction && <p>{about.focusIntroduction}</p>}<ul>{about.focusItems?.map((item,i)=><li key={i}><Check size={16}/><span>{item.text}</span></li>)}</ul></aside>}
    </div></section>
    {!!about.principles?.length && <section className="about-section about-pale"><div className="container"><Heading eyebrow="What guides our work" title={about.principlesHeading || "A clear foundation for working together"} introduction={about.principlesIntroduction}/><div className="about-principle-grid">{about.principles.map((item,i)=>{const Icon=icons[i%icons.length];return <article key={i} className="about-principle-card"><div className="about-card-top"><span className="about-icon"><Icon size={24}/></span><span>{String(i+1).padStart(2,"0")}</span></div><h3>{item.title}</h3><p>{item.description}</p></article>;})}</div></div></section>}
    {!!about.approachSteps?.length && <section className="about-section about-approach"><div className="container"><Heading eyebrow="From conversation to a plan" title={about.approachHeading || "How we work together"} introduction={about.approachIntroduction}/><ol className="about-step-grid">{about.approachSteps.map((step,i)=><li key={i}><span className="about-step-number">{String(i+1).padStart(2,"0")}</span><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol></div></section>}
    {about.marketsEnabled !== false && markets.length > 0 && <section className="about-section"><div className="container"><Heading eyebrow="Our initial marketplace scope" title={about.marketsHeading || "Four markets. Your priorities."} introduction={about.marketsIntroduction}/><div className="about-market-grid">{markets.map(market=><Link prefetch={false} href={`/contact?country=${encodeURIComponent(market.name)}`} key={market.slug} className="about-market-card"><span className="about-market-flag">{knownMarkets.has(market.slug) ? <CountryFlag country={market.slug as "usa"|"uk"|"australia"|"germany"}/> : <Globe2 size={32}/>}</span><h3>{market.name}</h3><span>Discuss this market<ArrowRight size={16}/></span></Link>)}</div></div></section>}
    {team.length > 0 && <section className="about-section about-pale"><div className="container"><Heading eyebrow="The people behind the work" title={about.teamHeading || "Meet our team"}/><div className="about-team-grid">{team.map((member,i)=><article key={i} className="about-team-card">{publicImage(member.portrait) ? <ResponsiveCMSImage settings={{image:member.portrait,imageRatio:"square",mobileImageRatio:"square"}}/> : <div className="about-team-placeholder" aria-hidden="true"><UserRound size={48}/></div>}<div><h3>{member.name}</h3><span>{member.role}</span>{member.bio && <p>{member.bio}</p>}</div></article>)}</div></div></section>}
    {about.contactHeading && <section className="about-section about-contact-section"><div className="container about-contact"><div><p className="eyebrow">Your next step</p><h2>{about.contactHeading}</h2>{about.contactIntroduction && <p>{about.contactIntroduction}</p>}</div><Link prefetch={false} href="/contact" className="button button-primary">{about.contactButtonLabel || "Let’s discuss"}<ArrowRight size={18}/></Link></div></section>}
  </main>;
}

