"use client";
import { useId, useState } from "react";
import { ArrowUpRight, Layers, RotateCcw } from "lucide-react";

const views = [
  { label: "Brief", title: "Start with a clear brief", text: "Identify what matters before choosing the next step.", tasks: ["Define your goals", "Identify your priorities", "Outline the requirements"] },
  { label: "Plan", title: "Bring the work into focus", text: "Turn the brief into a practical scope of work.", tasks: ["Agree the scope", "Assign responsibilities", "Confirm the timeline"] },
  { label: "Review", title: "Make the next decision", text: "Review the work and decide what comes next.", tasks: ["Review completed work", "Discuss feedback", "Choose next steps"] },
];
export function ServiceHeroVisual({serviceName}:{serviceName?:string} = {}) {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const [checked, setChecked] = useState<string[]>([]);
  const view = views[selected];
  const count = view.tasks.filter((_, i) => checked.includes(`${selected}:${i}`)).length;
  return <section className={`professional-service-visual ${serviceName ? "service-device-scene" : ""}`} aria-label="Interactive project preview">
    <div className="professional-visual-header"><span>VERTIX COMMERCE</span><span className="professional-visual-symbol"><Layers size={20} strokeWidth={1.4}/></span></div>
    <div className="professional-visual-title"><span>A considered approach</span><strong>Clarity at every step.</strong></div>
    <div className="service-laptop"><div className="professional-visual-workspace">
      <div className="professional-workspace-top"><span className="professional-workspace-dot"/><strong>{serviceName || "Project workspace"}</strong><span className="workspace-preview-label">Demo</span></div>
      <div className="workspace-tabs" role="tablist" aria-label="Project stages">{views.map((item,i)=><button key={item.label} id={`${id}-tab-${i}`} role="tab" aria-selected={selected===i} aria-controls={`${id}-panel`} tabIndex={selected===i?0:-1} onClick={()=>setSelected(i)} onKeyDown={event=>{
        if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
        event.preventDefault();
        const next=event.key==="Home"?0:event.key==="End"?views.length-1:(i+(event.key==="ArrowRight"?1:views.length-1))%views.length;
        setSelected(next);event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
      }}>{item.label}</button>)}</div>
      <div className="workspace-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${selected}`}>
        <h3>{view.title}</h3><p>{view.text}</p>
        <div className="workspace-tasks">{view.tasks.map((task,i)=>{const key=`${selected}:${i}`;return <label key={key}><input type="checkbox" checked={checked.includes(key)} onChange={()=>setChecked(current=>current.includes(key)?current.filter(item=>item!==key):[...current,key])}/><span>{task}</span></label>;})}</div>
        <div className="workspace-progress"><span role="status">{count} of {view.tasks.length} checked</span><button type="button" aria-label="Reset demo checklist" onClick={()=>setChecked([])}><RotateCcw size={13}/>Reset</button></div>
        <div className="workspace-progress-track" aria-hidden="true"><span style={{width:`${count/view.tasks.length*100}%`}}/></div>
      </div>
    </div>
    </div>{serviceName && <><div className="service-laptop-base" aria-hidden="true"/><div className="service-phone" aria-hidden="true"><span className="service-phone-camera"/><div className="service-phone-screen"><span className="service-phone-brand">VERTIX</span><strong>{view.label}</strong><span className="service-phone-subtitle">Project checklist</span>{view.tasks.map((task,i)=><div className="service-phone-task" key={task}><span className={checked.includes(`${selected}:${i}`)?"phone-task-done":""}>{checked.includes(`${selected}:${i}`)?"✓":""}</span><p>{task}</p></div>)}<div className="service-phone-progress">{count} / {view.tasks.length} checked</div><div className="workspace-progress-track"><span style={{width:`${count/view.tasks.length*100}%`}}/></div></div></div></>}
    <div className="professional-visual-footer"><span>Try a tab or check a task</span><a href="/about#our-story">Our approach<ArrowUpRight size={16}/></a></div>
  </section>;
}
