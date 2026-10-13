// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
vi.mock("@payload-config",()=>({default:{}}));
import { ReferenceHomepage } from "@/components/reference-homepage";
import { LeadForm } from "@/components/lead-form";
import { defaultChrome } from "@/lib/site-content";
import { referenceDefaults } from "@/lib/reference-homepage";
import type { SiteChrome } from "@/lib/site-content";

afterEach(cleanup);
const service = {slug:"cms-service",title:"CMS service",text:"Approved CMS description",category:"Commerce",categorySlug:"commerce",featured:true};
function chrome(ref: NonNullable<SiteChrome["homepage"]["referenceHomepage"]> = {}): SiteChrome {
  return {...defaultChrome,featuredServices:[service],services:[service],homepage:{businessName:"Vertix Commerce",homepageLayoutMode:"reference",referenceHomepage:{...referenceDefaults,compactLayout:false,...ref}}};
}
describe("reference-style homepage",()=>{
  it("renders the screenshot section order, CMS services and illustrative images",()=>{
    const {container}=render(<ReferenceHomepage chrome={chrome()}/>);
    expect([...container.querySelectorAll("main > section")].map(section=>section.id)).toEqual(["","services","countries","about","process","reviews","","discuss"]);
    expect(screen.getByRole("heading",{level:1}).textContent).toBe(defaultChrome.heroTitle);
    expect(screen.getByRole("heading",{name:"CMS service"})).toBeTruthy();
    expect(screen.getByAltText("Illustrative commerce professional working at a laptop").getAttribute("src")).toBe("/homepage/hero.webp");
    expect(container.querySelectorAll(".reference-market-card")).toHaveLength(4);
  });
  it("never fabricates sample sales figures or testimonials",()=>{
    render(<ReferenceHomepage chrome={chrome({reviews:[{name:"Unapproved person",quote:"Unapproved feedback",approved:false}]})}/>);
    expect(screen.queryByText("Unapproved feedback")).toBeNull();
    expect(screen.queryByText("$28,450")).toBeNull();
    expect(screen.getByText("No approved client reviews published yet.")).toBeTruthy();
  });
  it("shows only manually approved reviews and provided figures",()=>{
    render(<ReferenceHomepage chrome={chrome({reviews:[{name:"Approved QA reviewer",quote:"Fictional unit-test quote",approved:true,rating:4}],heroMetrics:[{label:"Approved QA metric",value:"Provided value"}]})}/>);
    expect(screen.getByText("Fictional unit-test quote")).toBeTruthy();
    expect(screen.getByLabelText("4 out of 5 stars")).toBeTruthy();
    expect(screen.getByText("Provided value")).toBeTruthy();
  });
  it("honors every section visibility control",()=>{
    const {container}=render(<ReferenceHomepage chrome={chrome({servicesEnabled:false,marketsEnabled:false,whyEnabled:false,processEnabled:false,reviewsEnabled:false,contactEnabled:false,faqEnabled:false,blogEnabled:false})}/>);
    expect(container.querySelectorAll("main > section")).toHaveLength(1);
  });
  it("preserves intentionally removed rows without restoring default content",()=>{
    const {container}=render(<ReferenceHomepage chrome={chrome({markets:[],heroChecks:[],heroBadges:[],whyCards:[],steps:[]})}/>);
    expect(container.querySelector("#countries")).toBeNull();
    expect(container.querySelector("#process")).toBeNull();
    expect(container.querySelector(".reference-benefits")).toBeNull();
    expect(container.querySelector(".reference-checks")).toBeNull();
  });
  it("does not resurrect deleted services and uses existing pages or contact routes",()=>{
    const data=chrome(); data.featuredServices=[];
    render(<ReferenceHomepage chrome={data}/>);
    expect(screen.queryByRole("heading",{name:"CMS service"})).toBeNull();
    expect(screen.getByText("No featured services published yet.")).toBeTruthy();
    expect(screen.getAllByRole("link",{name:/Discuss This Market/})[3].getAttribute("href")).toBe("/contact?country=Germany");
  });
  it("uses CMS meeting links and otherwise requests—not confirms—a meeting",()=>{
    const data=chrome(); data.contact.bookingURL="https://example.invalid/book";
    render(<ReferenceHomepage chrome={data}/>);
    expect(screen.getAllByRole("link",{name:/Schedule a Meeting/}).every(link=>link.getAttribute("href")==="https://example.invalid/book")).toBe(true);
    expect(screen.queryByText("Meeting requests are confirmed by the team.")).toBeNull();
  });
  it("rejects unsafe hero links and shows only saved contact destinations",()=>{
    const data=chrome();data.homepage.heroButtons=[{label:"Unsafe",url:"javascript:alert(1)"}];data.contact.whatsapp="+44 123 456 789";
    render(<ReferenceHomepage chrome={data}/>);
    expect(screen.queryByRole("link",{name:"Unsafe"})).toBeNull();
    expect(screen.getByRole("link",{name:/Chat with Us/}).getAttribute("href")).toBe("https://wa.me/44123456789");
  });
  it("takes Calendly meeting buttons to the privacy-aware booking page",()=>{
    const data=chrome(); data.contact.bookingURL="https://calendly.com/qa-only/consultation";
    render(<ReferenceHomepage chrome={data}/>);
    expect(screen.getAllByRole("link",{name:/Schedule a Meeting/}).every(link=>link.getAttribute("href")==="/meeting")).toBe(true);
  });
  it("shows published FAQs with native expandable controls and dynamic article links",()=>{
    const data=chrome();data.faqs=[{question:"CMS question?",answer:"Approved CMS answer"}];
    const {container}=render(<ReferenceHomepage chrome={data} articles={[{id:1,title:"CMS article",slug:"cms-article",excerpt:"CMS summary"}]}/>);
    expect(container.querySelector("details summary")?.textContent).toBe("CMS question?");
    expect(screen.getByText("Approved CMS answer")).toBeTruthy();
    expect(screen.getByRole("link",{name:"CMS article"}).getAttribute("href")).toBe("/blogs/cms-article");
    expect(screen.queryByText("No articles published yet.")).toBeNull();
  });
  it("keeps inquiry consent unchecked and required in the compact form",()=>{
    render(<ReferenceHomepage chrome={chrome()}/>);
    const consent=screen.getByRole("checkbox") as HTMLInputElement;
    expect(consent.checked).toBe(false);expect(consent.required).toBe(true);
    expect(screen.queryByLabelText(/password/i)).toBeNull();
  });
  it("preselects the country passed from a market link without changing service choices",()=>{
    render(<LeadForm services={[service]} initialCountry="Germany" compact/>);
    expect((screen.getByRole("combobox",{name:"Country"}) as HTMLSelectElement).value).toBe("Germany");
    expect(screen.getByRole("option",{name:"CMS service"})).toBeTruthy();
  });
});

describe("streamlined homepage",()=>{
  it("removes repeated hero details and empty article sections while retaining reviews and the inquiry form",()=>{
    const {container}=render(<ReferenceHomepage chrome={chrome({compactLayout:true})}/>);
    expect(container.querySelector(".reference-country-strip")).toBeNull();
    expect(container.querySelector(".reference-overlay-markets")).toBeNull();
    expect(container.querySelector(".reference-benefits")).toBeNull();
    expect(container.querySelector(".reference-why-cards")).toBeNull();
    expect(container.querySelector("#reviews")).toBeTruthy();
    expect(screen.getByText("No approved client reviews published yet.")).toBeTruthy();
    expect(container.querySelector(".reference-bottom")).toBeNull();
    expect(screen.getByRole("link",{name:/Explore services/}).getAttribute("href")).toBe("/#services");
    expect(screen.getByRole("button",{name:"Send inquiry"})).toBeTruthy();
  });
  it("uses a wide single-service card with CMS activities and puts FAQs before the final inquiry",()=>{
    const data=chrome({compactLayout:true});
    data.faqs=[{question:"CMS question?",answer:"CMS answer"}];
    data.featuredServices=[{...service,servicePage:{packages:[{title:"Saved activity",description:"Saved activity scope"}]}}];
    const {container}=render(<ReferenceHomepage chrome={data}/>);
    expect(screen.getByText("Saved activity")).toBeTruthy();
    expect(container.querySelector(".reference-service-grid-single")).toBeTruthy();
    const sections=[...container.querySelectorAll("main > section")];
    expect(sections.findIndex(section=>section.classList.contains("reference-bottom"))).toBeLessThan(sections.findIndex(section=>section.id==="discuss"));
    expect(screen.queryByText("No articles published yet.")).toBeNull();
  });
});
