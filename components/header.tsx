"use client";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import type { ServiceGroup } from "@/lib/content";
import Image from "next/image";
import logo from "@/logo.jpeg";
import { safeURL } from "@/lib/public-config";

export function Header({groups,servicesLabel,hasFAQs=false,aboutMenuLabel="About",extraLinks=[]}:{groups:ServiceGroup[];servicesLabel:string;hasFAQs?:boolean;aboutMenuLabel?:string;extraLinks?:{label:string;url:string}[]}){
  const [open,setOpen]=useState(false),[servicesOpen,setServicesOpen]=useState(false);
  return <header className="commerce-header sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div className="commerce-header-bar container flex h-20 items-center justify-between">
      <a href="/" aria-label="Vertix Commerce home" className="flex items-center"><Image src={logo} alt="Vertix Commerce" preload className="h-16 w-auto object-contain mix-blend-multiply" sizes="210px"/></a>
      <nav className="hidden items-center gap-7 md:flex">
        <a href="/" className="text-sm font-bold text-slate-600 hover:text-blue-600">Home</a>
        {groups.length > 0 ? <div className="static" onMouseEnter={()=>setServicesOpen(true)} onMouseLeave={()=>setServicesOpen(false)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setServicesOpen(false)}} onKeyDown={event=>{if(event.key==="Escape"){setServicesOpen(false);event.currentTarget.querySelector("button")?.focus()}}}><button className="flex items-center gap-1 py-7 text-sm font-bold text-slate-600 hover:text-blue-600" aria-expanded={servicesOpen} aria-controls="services-desktop-links" onClick={event=>setServicesOpen(event.detail===0?!servicesOpen:true)}>{servicesLabel}<ChevronDown size={15}/></button><div id="services-desktop-links" hidden={!servicesOpen} className="absolute left-0 right-0 top-full border-t border-slate-200 bg-white shadow-[0_22px_45px_rgba(7,26,56,.14)]"><div className="container grid gap-x-10 gap-y-8 py-9 lg:grid-cols-3">{groups.map(group=><section key={group.slug}><h2 className="text-sm font-black uppercase tracking-wide text-[#0a64f0]">{group.name}</h2><ul className="mt-4 space-y-3">{group.services.map(service=><li key={service.slug}><a href={"/services/"+service.slug} className="group/link flex items-center justify-between rounded-lg px-2 py-1.5 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"><span>{service.title}</span><span className="translate-x-[-4px] opacity-0 transition group-hover/link:translate-x-0 group-hover/link:opacity-100">→</span></a></li>)}</ul></section>)}</div></div></div> : <a href="/services" className="text-sm font-bold text-slate-600 hover:text-blue-600">{servicesLabel}</a>}
        <a href="/about" className="text-sm font-bold text-slate-600 hover:text-blue-600">{aboutMenuLabel}</a>
        <a href="/blogs" className="text-sm font-bold text-slate-600 hover:text-blue-600">Blogs</a>
        {extraLinks.filter(link=>safeURL(link.url,true)).map((link,i)=><a key={i} href={safeURL(link.url,true)} className="text-sm font-bold text-slate-600 hover:text-blue-600">{link.label}</a>)}<a href="/contact" className="button button-primary">Let&apos;s discuss <span aria-hidden="true">→</span></a>
      </nav>
      <button aria-label={open?"Close navigation":"Open navigation"} aria-expanded={open} onClick={()=>setOpen(!open)} className="md:hidden">{open?<X/>:<Menu/>}</button>
    </div>
    {open&&<nav className="commerce-mobile-nav container max-h-[calc(100vh-80px)] overflow-y-auto border-t border-slate-200 py-5 md:hidden"><a href="/" onClick={()=>setOpen(false)} className="mb-3 block py-2 font-bold">Home</a>{groups.length > 0 ? <><button onClick={()=>setServicesOpen(!servicesOpen)} aria-expanded={servicesOpen} className="flex w-full items-center justify-between py-2 font-bold">{servicesLabel}<ChevronDown className={servicesOpen?"rotate-180":""} size={18}/></button>{servicesOpen&&<div className="space-y-6 bg-slate-50 p-4">{groups.map(group=><section key={group.slug}><h2 className="text-xs font-black uppercase tracking-wide text-blue-600">{group.name}</h2><ul className="mt-2 space-y-2">{group.services.map(service=><li key={service.slug}><a href={"/services/"+service.slug} onClick={()=>setOpen(false)} className="block py-1 text-sm font-semibold">{service.title}</a></li>)}</ul></section>)}</div>}</> : <a href="/services" onClick={()=>setOpen(false)} className="block py-2 font-bold">{servicesLabel}</a>}<div className="mt-4 flex flex-col gap-4"><a href="/about" onClick={()=>setOpen(false)} className="block py-2 font-bold">{aboutMenuLabel}</a><a href="/blogs" onClick={()=>setOpen(false)} className="block py-2 font-bold">Blogs</a>{extraLinks.filter(link=>safeURL(link.url,true)).map((link,i)=><a key={i} href={safeURL(link.url,true)} onClick={()=>setOpen(false)} className="font-bold">{link.label}</a>)}<a href="/contact" className="button button-primary">Let&apos;s discuss</a></div></nav>}
  </header>;
}
