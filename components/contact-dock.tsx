"use client";
import { Bot, Mail, MessageCircle, Send, X, UserRound, Trash2, ArrowLeft } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { LeadForm } from "./lead-form";
import { defaultAssistant, whatsappURL, type AssistantConfig, type ContactConfig } from "@/lib/public-config";
import { meetingHref } from "@/lib/booking";
type Msg={role:"user"|"assistant"|"human";content:string;sentAt?:string};
const greeting=(de:boolean)=>de?"Hallo – ich bin Vertix, Ihr Commerce-Assistent. Ich nutze nur freigegebene Inhalte. Wie kann ich helfen?":"Hello — I’m Vertix, your Commerce Assistant. I use only approved content. How can I help?";
const emptyContact:ContactConfig={email:"",whatsapp:"",bookingURL:""};
export function ContactDock({config=defaultAssistant,contact=emptyContact,services=[]}:{config?:AssistantConfig;contact?:ContactConfig;services?:{slug:string;title:string}[]}) {
  const [live,setLive]=useState(config),[links,setLinks]=useState(contact),[open,setOpen]=useState(false),[loading,setLoading]=useState(false),[locale,setLocale]=useState<"en"|"de">("en"),[leadOpen,setLeadOpen]=useState(false);
  const [store,setStore]=useState(false),[hasStored,setHasStored]=useState(false),[ready,setReady]=useState(false),[notice,setNotice]=useState(""),[messages,setMessages]=useState<Msg[]>([{role:"assistant",content:greeting(false)}]);
  const input=useRef<HTMLInputElement>(null), launcher=useRef<HTMLButtonElement>(null), end=useRef<HTMLDivElement>(null), busy=useRef(false), initialized=useRef(false);
  const de=locale==="de";
  const whatsapp=whatsappURL(links.whatsapp);
  useEffect(()=>{setLive(config);setLinks(contact)},[config,contact]);
  useEffect(()=>{if(open&&!leadOpen)input.current?.focus()},[open,leadOpen]);
  useEffect(()=>{end.current?.scrollIntoView({block:"nearest"})},[messages,loading]);
  useEffect(()=>{
    if(!open)return;
    const controller=new AbortController();
    async function refresh() {
      try {
        const response=await fetch("/api/assistant",{cache:"no-store",signal:controller.signal});if(!response.ok)throw new Error("Unavailable");
        const data=await response.json();setLive(data.config);setLinks(data.contact);
        setReady(true);
        if(!data.config.enabled)setOpen(false);
        if(!initialized.current){initialized.current=true;setStore(data.stored===true)}
        setHasStored(data.stored===true);
        if(!busy.current&&data.stored&&Array.isArray(data.messages)&&data.messages.length)setMessages(data.messages);
      }catch{if(!controller.signal.aborted)setNotice("Connection unavailable. Please try again shortly or use the contact form. / Verbindung nicht verfügbar. Bitte nutzen Sie das Kontaktformular.")}
    }
    void refresh();const timer=setInterval(refresh,store?12000:30000);
    return()=>{controller.abort();clearInterval(timer)};
  },[open,store]);
  function close(){setOpen(false);setLeadOpen(false);launcher.current?.focus()}
  async function send(event?:FormEvent,action:"message"|"handoff"="message") {
    event?.preventDefault();
    const value=action==="handoff"?(de?"Ich bitte um menschliche Rückmeldung.":"I would like human follow-up."):input.current?.value.trim();
    if(!value||busy.current||!ready)return;
    busy.current=true;setLoading(true);setNotice("");
    if(input.current)input.current.value="";
    const next:Msg[]=[...messages,{role:"user",content:value}];setMessages(next);
    try {
      const response=await fetch("/api/chat",{method:"POST",headers:{"content-type":"application/json"},signal:AbortSignal.timeout(22000),body:JSON.stringify({message:value,locale,action,storeConversation:store,history:messages.slice(-6).map(item=>({role:item.role==="human"?"assistant":item.role,content:item.content.slice(0,1500)}))})});
      const result=await response.json();
      const text=result.message||(de?"Der Assistent ist vorübergehend nicht verfügbar. Bitte verwenden Sie das Kontaktformular.":result.error||"The assistant is temporarily unavailable. Please use the contact form.");
      setMessages([...next,{role:"assistant",content:text}]);
      if(result.stored)setHasStored(true);
      if(result.storageError)setNotice(de?"Die Antwort wurde nicht gespeichert. Bitte versuchen Sie es erneut oder nutzen Sie das Kontaktformular.":"This reply could not be stored. Please try again or use the contact form.");
    }catch{setMessages([...next,{role:"assistant",content:de?"Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut oder nutzen Sie das Kontaktformular.":"Connection failed. Please try again or use the contact form."}])}
    finally{busy.current=false;setLoading(false)}
  }
  async function forget() {
    if(busy.current)return;busy.current=true;setLoading(true);
    try{const response=await fetch("/api/assistant",{method:"DELETE",signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error();setReady(false);setHasStored(false);setStore(false);initialized.current=false;setOpen(false);setMessages([{role:"assistant",content:greeting(de)}]);setNotice(de?"Gespeicherter Chat gelöscht.":"Stored chat deleted.")}
    catch{setNotice(de?"Der gespeicherte Chat konnte nicht gelöscht werden. Bitte kontaktieren Sie das Team.":"The stored chat could not be deleted. Please contact the team.")}
    finally{busy.current=false;setLoading(false)}
  }
  function changeLanguage(){const next=locale==="en"?"de":"en";setLocale(next);if(messages.length===1)setMessages([{role:"assistant",content:greeting(next==="de")}])}
  if(!live.enabled&&!links.email&&!whatsapp)return null;
  return <><div className="pointer-events-none fixed inset-x-3 bottom-4 z-50 flex flex-col items-end gap-3 sm:left-auto sm:right-6 sm:w-[390px]">
    {open&&live.enabled&&<section role="dialog" aria-label="Vertix Commerce Assistant" lang={locale} onKeyDown={event=>{if(event.key==="Escape")close()}} className="pointer-events-auto card flex h-[min(610px,calc(100dvh-170px))] w-full flex-col overflow-hidden">
      <header className="flex items-start justify-between gap-2 bg-[#071a38] p-4 text-white"><div className="flex items-center gap-3"><Bot size={24} aria-hidden="true" className="shrink-0"/><div><h2 className="font-black leading-5">Vertix</h2><p className="mt-1 text-xs text-blue-200">{de?"KI-Assistent • menschliche Rückmeldung nicht sofort verfügbar":"AI assistant • human follow-up not immediately available"}</p></div></div><button aria-label={de?"Chat schließen":"Close chat"} onClick={close} className="p-1"><X size={20}/></button></header>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2 text-xs"><span>{de?"Keine Passwörter oder Kartendaten teilen.":"Never share passwords or card details."}</span><button onClick={changeLanguage} className="shrink-0 font-bold text-blue-700">{de?"English":"Deutsch"}</button></div>
      {leadOpen?<div className="flex-1 overflow-y-auto p-4"><button onClick={()=>setLeadOpen(false)} className="mb-4 flex items-center gap-2 text-sm font-bold text-blue-700"><ArrowLeft size={16}/>{de?"Zurück zum Chat":"Back to chat"}</button><p className="mb-4 text-xs leading-5 text-slate-600">{de?live.offlineMessageDE:live.offlineMessage}</p><LeadForm services={services} locale={locale} source="assistant"/></div>:<>
        <div aria-live="polite" aria-relevant="additions text" className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">{messages.map((message,i)=><div key={i} className={message.role==="user"?"ml-auto max-w-[90%]":"max-w-[90%]"}>{message.role==="human"&&<span className="text-xs font-bold text-blue-700">{de?"Team":"Team"}</span>}<p className={"whitespace-pre-line break-words rounded-2xl p-3 text-sm leading-6 "+(message.role==="user"?"bg-blue-600 text-white":"bg-white text-slate-700 shadow-sm")}>{message.content}</p></div>)}{loading&&<p className="text-sm text-slate-500">{de?"Wird verarbeitet…":"Working…"}</p>}<div ref={end}/></div>
        <div className="border-t bg-white px-3 py-2 text-xs leading-5"><details className="mb-1 text-slate-600"><summary className="cursor-pointer">{de?"Wie Gemini verwendet wird":"How Gemini is used"}</summary><p>{de?"Nur freigegebene öffentliche Inhalte, öffentliche Kommunikationsvorgaben und passende Themenwörter werden an Gemini gesendet, nicht Ihre Kontaktdaten oder der Chatverlauf.":"Only approved public knowledge, public communication preferences and matching topic words are sent to Gemini—not contact details or your chat history."}</p></details><label className="flex items-start gap-2"><input type="checkbox" checked={store} onChange={event=>setStore(event.target.checked)} className="mt-1"/><span>{de?"Ich willige ein, den Chat für Team-Rückmeldungen zu speichern (optional).":"I consent to storing this chat for team follow-up (optional)."} </span></label>{hasStored&&<button disabled={loading||!ready} onClick={forget} className="mt-1 flex items-center gap-1 text-blue-700 underline"><Trash2 size={12}/>{de?"Gespeicherten Chat löschen":"Delete stored chat"}</button>}</div>
        <form onSubmit={send} className="flex gap-2 border-t bg-white p-3"><label className="sr-only" htmlFor="chat-message">{de?"Nachricht":"Message"}</label><input ref={input} id="chat-message" maxLength={1200} disabled={loading||!ready} placeholder={de?"Nachricht eingeben…":"Type your message…"} className="min-w-0 flex-1 rounded-full border px-4 py-3 text-sm"/><button disabled={loading||!ready} aria-label={de?"Nachricht senden":"Send message"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-600 text-white disabled:opacity-50"><Send size={18}/></button></form>
      </>}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t bg-white p-3 text-xs font-bold text-blue-700"><a href="/contact">{de?"Kontaktformular":"Let's Discuss"}</a>{links.bookingURL&&<a href={meetingHref(links.bookingURL)}>{de?"Termin buchen":"Book a meeting"}</a>}{live.allowLeadCapture&&services.length>0&&<button onClick={()=>setLeadOpen(!leadOpen)}>{de?"Anfrage hinterlassen":"Leave an inquiry"}</button>}{live.humanHandoffEnabled&&!leadOpen&&<button disabled={loading||!ready} onClick={()=>void send(undefined,"handoff")} className="flex items-center gap-1"><UserRound size={14}/>{de?"Menschliche Rückmeldung":"Human follow-up"}</button>}</div>
      {notice&&<p role="status" className="border-t bg-white p-3 text-xs leading-5">{notice}</p>}
    </section>}
    <div className="pointer-events-auto flex flex-col items-end gap-3">
      {links.email&&!open&&<a aria-label="Email Vertix Commerce" title="Email us" href={"mailto:"+links.email+"?subject=Vertix%20Commerce%20inquiry"} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-[#082840] shadow-lg transition hover:bg-blue-50"><Mail size={22}/></a>}

      {whatsapp&&<a aria-label="Message Vertix Commerce on WhatsApp" title="Chat with us on WhatsApp" href={whatsapp} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#075e54] text-white shadow-md transition hover:bg-[#064d44] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075e54]"><svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .1 5.4.1 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6a12 12 0 0 0 5.8 1.5h.1c6.6 0 12-5.4 12-12a12 12 0 0 0-3.6-8.4ZM12.1 22a10 10 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.3-.4a10 10 0 0 1-1.5-5.3C2.1 6.5 6.6 2 12.1 2s10 4.5 10 10-4.5 10-10 10Zm5.5-7.5c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.3 3.1c.1.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4Z"/></svg></a>}
      {live.enabled&&<button ref={launcher} onClick={()=>open?close():setOpen(true)} aria-label={open?(de?"Chat schließen":"Close Vertix chat"):(de?"Vertix-Assistent öffnen":"Ask Vertix")} aria-expanded={open} className="flex h-12 items-center gap-2 rounded-full border-2 border-white bg-blue-600 px-4 font-black text-white shadow-lg"><Bot size={20} aria-hidden="true"/><span className="hidden sm:inline">{de?"Vertix fragen":"Ask Vertix"}</span></button>}
    </div>
  </div></>;
}
