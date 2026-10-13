import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkspaceGroups } from "@/components/admin/WorkspaceGroups";
import { adminModules } from "@/lib/admin-navigation";

describe("compact dashboard workspace", () => {
  it("starts all groups closed and retains each destination exactly once", () => {
    const permissions = {
      collections: Object.fromEntries(adminModules.filter(module => !("global" in module)).map(module => [module.slug, { read: true as const, fields: true as const }])),
      globals: Object.fromEntries(adminModules.filter(module => "global" in module).map(module => [module.slug, { read: true as const, fields: true as const }])),
    };
    const html = renderToStaticMarkup(<WorkspaceGroups permissions={permissions} />);
    expect(html.match(/<details\b/g)).toHaveLength(4);
    expect(html.match(/<summary\b/g)).toHaveLength(4);
    expect(html).not.toMatch(/<details[^>]*\bopen(?:[\s=>])/);
    for (const module of adminModules) {
      const href = 'href="/admin/' + ("global" in module ? "globals/" : "collections/") + module.slug + '"';
      expect(html.split(href)).toHaveLength(2);
    }
  });
  it("renders nothing without permission and excludes unavailable destinations", () => {
    expect(renderToStaticMarkup(<WorkspaceGroups permissions={{}} />)).toBe("");
    const html = renderToStaticMarkup(<WorkspaceGroups permissions={{ collections: { services: { read: true, fields: true } } }} />);
    expect(html.match(/<details\b/g)).toHaveLength(1);
    expect(html).toContain('href="/admin/collections/services"');
    expect(html).not.toContain("/admin/collections/leads");
    expect(html).not.toContain("/admin/globals/website-settings");
  });
});
