import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SidebarLinks } from "@/components/admin/SidebarLinks";
import { adminModules, groupedAdminModules } from "@/lib/admin-navigation";

// The server wrapper only passes filtered destinations to the interactive drawer.
vi.mock("@/components/admin/SidebarNav", () => ({ SidebarNav: () => null }));
import { AdminNav } from "@/components/admin/AdminNav";

const permissions = {
  collections: Object.fromEntries(adminModules.filter(module => !("global" in module)).map(module => [module.slug, { read: true as const, fields: true as const }])),
  globals: Object.fromEntries(adminModules.filter(module => "global" in module).map(module => [module.slug, { read: true as const, fields: true as const }])),
};
const groups = groupedAdminModules(permissions);

describe("graphical admin navigation", () => {
  it("shows four closed icon groups on the overview without explanatory paragraphs", () => {
    const html = renderToStaticMarkup(<SidebarLinks groups={groups} pathname="/admin" />);
    expect(html.match(/<details\b/g)).toHaveLength(4);
    expect(html).not.toMatch(/<details[^>]*\bopen(?:[\s=>])/);
    expect(html).toContain('aria-label="Admin navigation"');
    expect(html).toContain("<svg");
    expect(html).not.toMatch(/<p(?:\s|>)/);
    for (const module of adminModules) {
      const href = 'href="/admin/' + ("global" in module ? "globals/" : "collections/") + module.slug + '"';
      expect(html.split(href)).toHaveLength(2);
      expect(html).not.toContain(module.description);
    }
  });

  it("opens only the current editor's group and marks its link as current", () => {
    const html = renderToStaticMarkup(<SidebarLinks groups={groups} pathname="/admin/collections/services/123" />);
    expect(html.match(/<details[^>]*\bopen(?:[\s=>])/g)).toHaveLength(1);
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/admin\/collections\/services"/);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
  });

  it("retains account, website, and native sign-out controls", () => {
    const html = renderToStaticMarkup(<SidebarLinks groups={[]} pathname="/admin/account" />);
    expect(html).not.toContain("<details");
    expect(html).toContain('href="/admin/account"');
    expect(html).toContain('href="/admin/logout"');
    expect(html).toContain('target="_blank" rel="noreferrer"');
    expect(html).toContain("My account");
  });

  it("filters server-provided groups by permissions and entity visibility", () => {
    const nav = AdminNav({ permissions, visibleEntities: { collections: ["services"], globals: [] } });
    const filtered = nav.props.groups as ReturnType<typeof groupedAdminModules>;
    expect(filtered).toHaveLength(1);
    expect(filtered[0].modules.map(module => module.slug)).toEqual(["services"]);
    expect(AdminNav({ permissions: {} }).props.groups).toEqual([]);
  });
});
