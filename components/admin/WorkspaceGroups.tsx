import React from "react";
import type { SanitizedPermissions } from "payload";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { groupedAdminModules } from "@/lib/admin-navigation";
import { AdminIcon } from "./AdminIcon";

export function WorkspaceGroups({ permissions }: { permissions: SanitizedPermissions }) {
  const groups = groupedAdminModules(permissions);
  if (!groups.length) return null;
  return <section className="vx-workspace" aria-labelledby="workspace-heading">
    <div className="vx-section-heading">
      <h2 id="workspace-heading">Manage your workspace</h2>
      <p>Choose a group to reveal its tools, or use the sidebar to jump directly to a section.</p>
    </div>
    <div className="vx-workspace-groups">
      {groups.map(group => <details className="vx-tool-group" key={group.title}>
        <summary>
          <span className="vx-icon"><AdminIcon name={group.icon} /></span>
          <span className="vx-tool-group-title"><strong>{group.title}</strong><small>{group.description}</small></span>
          <span className="vx-tool-count">{group.modules.length} {group.modules.length === 1 ? "tool" : "tools"}</span>
          <ChevronDown className="vx-tool-chevron" size={18} aria-hidden="true" />
        </summary>
        <ul className="vx-tool-links">
          {group.modules.map(module => <li key={module.slug}>
            <Link href={"/control-room-6f3a9d82c17e/" + ("global" in module ? "globals/" : "collections/") + module.slug}>
              <span><strong>{module.title}</strong><small>{module.description}</small></span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </li>)}
        </ul>
      </details>)}
    </div>
  </section>;
}
