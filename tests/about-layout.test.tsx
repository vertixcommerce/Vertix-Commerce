// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AboutContent } from "@/components/about-content";
afterEach(cleanup);
describe("About CMS layout", () => {
  it("renders entered principles, approach and market links while keeping unapproved staff hidden", () => {
    render(<AboutContent bookingURL="" markets={[{slug:"germany",name:"Germany",introduction:"Local scope"}]} about={{principles:[{title:"Defined scope",description:"Agree the plan"}],approachSteps:[{title:"Review",description:"Discuss next steps"}],teamMembers:[{name:"Approved fixture",role:"Fixture role",approved:true},{name:"Private fixture",role:"Unpublished role",approved:false}],contactHeading:"Discuss your scope",contactButtonLabel:"Contact the team"}}/>);
    expect(screen.getByText("Defined scope")).toBeTruthy();
    expect(screen.getByText("Discuss next steps")).toBeTruthy();
    expect(screen.getByRole("link",{name:/Germany/}).getAttribute("href")).toBe("/contact?country=Germany");
    expect(screen.getByText("Approved fixture")).toBeTruthy();
    expect(screen.queryByText("Private fixture")).toBeNull();
    expect(screen.getByRole("link",{name:/Contact the team/}).getAttribute("href")).toBe("/contact");
  });
  it("honours an intentionally hidden market section and never invents team members", () => {
    render(<AboutContent bookingURL="" markets={[{slug:"germany",name:"Germany",introduction:"Local scope"}]} about={{marketsEnabled:false,principles:[],approachSteps:[],teamMembers:[]}}/>);
    expect(screen.queryByRole("link",{name:/Germany/})).toBeNull();
    expect(screen.queryByRole("heading",{name:"Meet our team"})).toBeNull();
    expect(screen.queryByRole("heading",{name:"How we work together"})).toBeNull();
  });
});
