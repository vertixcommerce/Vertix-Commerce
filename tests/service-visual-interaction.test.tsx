// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ServiceHeroVisual } from "@/components/service-hero-visual";
import { Header } from "@/components/header";
vi.mock("next/image",()=>({default:({alt}:{alt?:string})=><img alt={alt} src="/logo.jpeg"/>}));
afterEach(cleanup);
describe("Shared project preview",()=>{
  it("supports task interaction, tab changes, keyboard navigation and reset",()=>{
    render(<ServiceHeroVisual/>);
    fireEvent.click(screen.getByRole("checkbox",{name:"Define your goals"}));
    expect(screen.getByRole("status").textContent).toBe("1 of 3 checked");
    fireEvent.click(screen.getByRole("tab",{name:"Plan"}));
    expect(screen.getByText("Bring the work into focus")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("tab",{name:"Plan"}),{key:"ArrowLeft"});
    expect((screen.getByRole("checkbox",{name:"Define your goals"}) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole("button",{name:"Reset demo checklist"}));
    expect(screen.getByRole("status").textContent).toBe("0 of 3 checked");
    expect(screen.getByRole("link",{name:"Our approach"}).getAttribute("href")).toBe("/about#our-story");
  });
  it("keeps FAQs out of desktop and mobile navigation",()=>{
    render(<Header groups={[]} servicesLabel="Services" hasFAQs/>);
    expect(screen.queryByRole("link",{name:"FAQs"})).toBeNull();
    fireEvent.click(screen.getByRole("button",{name:"Open navigation"}));
    expect(screen.queryByRole("link",{name:"FAQs"})).toBeNull();
  });
});
