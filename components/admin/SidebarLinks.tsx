import React from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import type { groupedAdminModules } from "@/lib/admin-navigation";
import { AdminIcon } from "./AdminIcon";

type SidebarGroups = ReturnType<typeof groupedAdminModules>;
export function SidebarLinks({ groups, pathname }: { groups: SidebarGroups; pathname: string }) {
  const hrefFor = (module: SidebarGroups[number]["modules"][number]) => "/control-room-6f3a9d82c17e/" + ("global" in module ? "globals/" : "collections/") + module.slug;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  return <nav className="vx-sidebar-links" aria-label="Admin navigation">
    <Link className={"vx-sidebar-link" + (pathname === "/control-room-6f3a9d82c17e" ? " is-active" : "")} href="/control-room-6f3a9d82c17e" aria-current={pathname === "/control-room-6f3a9d82c17e" ? "page" : undefined} prefetch={false}><LayoutDashboard size={18} aria-hidden="true" /><span>Overview</span></Link>
    <div className="vx-sidebar-groups">
      {groups.map(group => {
        const active = group.modules.some(module => isActive(hrefFor(module)));
        return <details className="vx-sidebar-group" open={active} key={group.title + String(active)}>
          <summary><AdminIcon name={group.icon} /><span>{group.title === "Website content" ? "Content" : group.title}</span><ChevronDown className="vx-sidebar-chevron" size={15} aria-hidden="true" /></summary>
          <ul>{group.modules.map(module => <li key={module.slug}>
            <Link className={"vx-sidebar-link" + (isActive(hrefFor(module)) ? " is-active" : "")} href={hrefFor(module)} aria-current={isActive(hrefFor(module)) ? "page" : undefined} prefetch={false}>
              <AdminIcon name={module.icon} /><span>{module.title === "Website settings" ? "Website" : module.title === "Assistant settings" ? "Preferences" : module.title === "Customer inquiries" ? "Inquiries" : module.title === "Team members" ? "Team" : module.title}</span>
            </Link>
          </li>)}</ul>
        </details>;
      })}
    </div>
    <div className="vx-sidebar-footer">
      <Link className={"vx-sidebar-link" + (isActive("/control-room-6f3a9d82c17e/account") ? " is-active" : "")} href="/control-room-6f3a9d82c17e/account" aria-current={isActive("/control-room-6f3a9d82c17e/account") ? "page" : undefined} prefetch={false}><UserCircle size={18} aria-hidden="true" /><span>My account</span></Link>
      <a className="vx-sidebar-link" href="/" target="_blank" rel="noreferrer"><ExternalLink size={18} aria-hidden="true" /><span>View website</span></a>
      <Link className="vx-sidebar-link vx-sidebar-signout" href="/control-room-6f3a9d82c17e/logout" prefetch={false}><LogOut size={18} aria-hidden="true" /><span>Sign out</span></Link>
    </div>
  </nav>;
}
