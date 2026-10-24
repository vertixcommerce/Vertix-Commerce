import { describe, expect, it } from "vitest";
import type { AccessArgs, FieldAccessArgs, Field } from "payload";
import { administrator, contentEditor, leadTeam, ownerField, ownerOnly, publishedOrAuthenticated, selfOrAdministrator, selfOrOwner, supportTeam } from "@/payload/access";
import { Users } from "@/payload/collections/Users";
import { Media } from "@/payload/collections/Media";
import { Articles } from "@/payload/collections/Articles";
import { AboutPage } from "@/payload/globals/AboutPage";
import { Services } from "@/payload/collections/Services";
import { Countries } from "@/payload/collections/Countries";
import { FAQs } from "@/payload/collections/FAQs";
import { Knowledge } from "@/payload/collections/Knowledge";
import { Leads } from "@/payload/collections/Leads";
import { Conversations } from "@/payload/collections/Conversations";
import { ServiceCategories } from "@/payload/collections/ServiceCategories";
import { WebsiteSettings } from "@/payload/globals/WebsiteSettings";
import { AssistantSettings } from "@/payload/globals/AssistantSettings";
import { referenceHomepageFields } from "@/payload/reference-homepage-fields";
import { adminModules, groupedAdminModules, visibleAdminModules } from "@/lib/admin-navigation";

const args = (role?: string) => ({ req: { user: role ? { id: 42, roles: [role] } : null } }) as AccessArgs;
function paths(fields: Field[]): string[] {
  return fields.flatMap(field => {
    if (field.type === "tabs") return field.tabs.flatMap(tab => "name" in tab ? [tab.name!] : paths(tab.fields));
    if (field.type === "row" || field.type === "collapsible") return paths(field.fields);
    return "name" in field ? [field.name] : [];
  });
}
describe("admin access", () => {
  it("revokes public AI-instruction approval when a non-owner edits the text", async () => {
    const result = await AssistantSettings.hooks!.beforeChange![0]({ data: { instructions: "Changed preferences", publicInstructionsApproved: true }, originalDoc: { instructions: "Previously approved" }, req: { user: { roles: ["administrator"] } } } as never);
    expect(result.publicInstructionsApproved).toBe(false);
  });
  it("rejects anonymous access to account and team data", () => {
    expect(selfOrAdministrator(args())).toBe(false);
    expect(administrator(args())).toBe(false);
  });
  it("filters anonymous versioned content to published revisions and keeps knowledge private", async () => {
    expect(publishedOrAuthenticated(args())).toEqual({ and: [{ status: { equals: "published" } }, { _status: { equals: "published" } }] });
    expect(await Knowledge.access!.read!(args())).toBe(false);
  });
  it.each(["editor", "sales", "support", "viewer"])("limits %s account edits to their own record", role => {
    expect(selfOrAdministrator(args(role))).toEqual({ id: { equals: 42 } });
    expect(ownerField(args(role) as FieldAccessArgs)).toBe(false);
  });
  it.each(["owner", "administrator"])("allows %s to manage team records", role => {
    expect(selfOrAdministrator(args(role))).toBe(true);
  });
  it("limits account updates to the owner or the account holder", () => {
    expect(selfOrOwner(args("administrator"))).toEqual({ id: { equals: 42 } });
    expect(selfOrOwner(args("editor"))).toEqual({ id: { equals: 42 } });
    expect(selfOrOwner(args("owner"))).toBe(true);
    expect(selfOrOwner(args())).toBe(false);
    expect(Users.access?.update).toBe(selfOrOwner);
  });
  it("restricts force-unlock and deleting team accounts to owners", () => {
    expect(ownerOnly(args("owner"))).toBe(true);
    expect(ownerOnly(args("administrator"))).toBe(false);
    expect(Users.access?.create).toBe(ownerOnly);
    expect(Users.access?.unlock).toBe(ownerOnly);
    expect(Users.access?.delete).toBe(ownerOnly);
  });
  it("only lets owners assign roles on both create and update", () => {
    const roles = Users.fields.find(field => "name" in field && field.name === "roles");
    expect(roles && "access" in roles ? roles.access?.create : undefined).toBe(ownerField);
    expect(roles && "access" in roles ? roles.access?.update : undefined).toBe(ownerField);
    expect(ownerField(args("owner") as FieldAccessArgs)).toBe(true);
    expect(ownerField(args("administrator") as FieldAccessArgs)).toBe(false);
  });
  it("separates content, sales, and support capabilities", () => {
    expect(contentEditor(args("editor"))).toBe(true);
    expect(leadTeam(args("editor"))).toBe(false);
    expect(leadTeam(args("sales"))).toBe(true);
    expect(supportTeam(args("sales"))).toBe(false);
    expect(supportTeam(args("support"))).toBe(true);
    expect(contentEditor(args("support"))).toBe(false);
  });
});
describe("complete admin navigation and editors", () => {
  it("covers every configured collection and global exactly once", () => {
    const collections = [Users, Services, ServiceCategories, Countries, FAQs, Knowledge, Leads, Conversations, Media, Articles];
    const globals = [WebsiteSettings, AssistantSettings, AboutPage];
    expect(adminModules.map(module => module.slug).sort()).toEqual([...collections, ...globals].map(module => module.slug).sort());
    expect(new Set(adminModules.map(module => module.slug)).size).toBe(adminModules.length);
  });
  it("does not show restricted modules or expose an empty permission set", () => {
    expect(visibleAdminModules({})).toEqual([]);
    expect(visibleAdminModules({ collections: { services: { read: true, fields: true } }, globals: { "website-settings": { read: true, fields: true } } }).map(module => module.slug)).toEqual(["services", "website-settings"]);
  });
  it("organizes every available destination once into at most four groups", () => {
    const permissions = {
      collections: Object.fromEntries(adminModules.filter(module => !("global" in module)).map(module => [module.slug, { read: true as const, fields: true as const }])),
      globals: Object.fromEntries(adminModules.filter(module => "global" in module).map(module => [module.slug, { read: true as const, fields: true as const }])),
    };
    const groups = groupedAdminModules(permissions);
    expect(groups.map(group => group.title)).toEqual(["Website content", "Customers", "Assistant", "Settings"]);
    const slugs = groups.flatMap(group => group.modules.map(module => module.slug));
    expect(slugs.sort()).toEqual(adminModules.map(module => module.slug).sort());
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it("omits empty groups and restricted tools", () => {
    expect(groupedAdminModules({})).toEqual([]);
    const groups = groupedAdminModules({ collections: { services: { read: true, fields: true } } });
    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Website content");
    expect(groups[0].modules.map(module => module.slug)).toEqual(["services"]);
  });
  it("keeps existing saved-data paths while arranging editors into tabs", () => {
    expect(paths(Services.fields)).toContain("navigationVisible");
    expect(paths(Services.fields)).toContain("slug");
    expect(paths(Leads.fields)).toContain("consentedAt");
    expect(paths(Conversations.fields)).toContain("messages");
    expect(paths(WebsiteSettings.fields)).toContain("socialLinks");
    expect(paths(AssistantSettings.fields)).toContain("instructions");
  });
  it("makes review cards discoverable without changing their saved group path", () => {
    const tabs = WebsiteSettings.fields.find(field => field.type === "tabs");
    expect(tabs?.type).toBe("tabs");
    if (tabs?.type !== "tabs" || referenceHomepageFields.type !== "group") throw new Error("Missing website tabs");
    const homepageTab = tabs.tabs.find(tab => tab.label === "Homepage sections");
    expect(homepageTab?.fields).toContain(referenceHomepageFields);
    expect("name" in referenceHomepageFields && referenceHomepageFields.name).toBe("referenceHomepage");
    const sectionTabs = referenceHomepageFields.fields[0];
    if (sectionTabs.type !== "tabs") throw new Error("Missing review tab");
    expect(sectionTabs.tabs[0].label).toBe("Client reviews");
    expect(paths(sectionTabs.tabs[0].fields)).toContain("reviews");
    expect(paths(sectionTabs.tabs[0].fields)).toContain("reviewsEnabled");
    expect(paths(sectionTabs.tabs[0].fields)).toContain("reviewsHeading");
    expect("name" in sectionTabs.tabs[0]).toBe(false);
  });
});
