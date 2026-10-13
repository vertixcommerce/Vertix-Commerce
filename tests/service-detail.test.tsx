// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/components/homepage-sections", () => ({ ResponsiveCMSImage: () => <img alt="CMS image"/> }));
import { ServiceDetail } from "@/components/service-detail";
import type { PublicService } from "@/lib/content";
afterEach(cleanup);
const service: PublicService = {slug:"ebay-account-management",title:"eBay Management",text:"Account support",category:"Commerce",categorySlug:"commerce"};
const contact = {email:"",whatsapp:"",bookingURL:""};
describe("CMS service layout", () => {
  it("renders the service and honest meeting fallback without invented proof", () => {
    render(<ServiceDetail service={service} contact={contact}/>);
    expect(screen.getByRole("heading",{level:1}).textContent).toBe("eBay Management");
    expect(screen.getByRole("link",{name:"Schedule a meeting"}).getAttribute("href")).toBe("/contact?intent=meeting");
    expect(screen.queryByText("Documented results")).toBeNull();
    expect(screen.getByRole("region",{name:"Interactive project preview"})).toBeTruthy();
  });
  it("keeps the description visible by default and allows hiding it per service", () => {
    const populated: PublicService = {...service, fullDescription: {root:{type:"root",children:[],direction:null,format:"",indent:0,version:1}}};
    const view = render(<ServiceDetail service={populated} contact={contact}/>);
    expect(screen.getByRole("heading",{name:"About this service"})).toBeTruthy();
    view.rerender(<ServiceDetail service={{...populated,servicePage:{hideAboutSection:true}}} contact={contact}/>);
    expect(screen.queryByRole("heading",{name:"About this service"})).toBeNull();
    expect(screen.getByRole("heading",{level:1})).toBeTruthy();
    view.rerender(<ServiceDetail service={{...populated,servicePage:{hideAboutSection:false}}} contact={contact}/>);
    expect(screen.getByRole("heading",{name:"About this service"})).toBeTruthy();
  });
  it("creates components from entered rows and excludes unapproved results and case studies", () => {
    render(<ServiceDetail contact={contact} service={{...service,servicePage:{results:[{value:"12",label:"Reviewed listings",context:"January audit",approved:true},{value:"999%",label:"Unverified",context:"Unknown",approved:false}],caseStudies:[{title:"Approved project",description:"Documented work",approved:true},{title:"Private project",description:"Draft",approved:false}],packages:[{title:"Listing review",description:"Review product information",items:[{text:"Check attributes"}]}],faqs:[{question:"How do we start?",answer:"Send an inquiry."}]}}}/>);
    expect(screen.getByText("Reviewed listings")).toBeTruthy();
    expect(screen.queryByText("999%")).toBeNull();
    expect(screen.queryByText("Private project")).toBeNull();
    expect(screen.getByText("Approved project")).toBeTruthy();
    expect(screen.getByText("Check attributes")).toBeTruthy();
    expect(screen.getByText("How do we start?")).toBeTruthy();
  });
});


