"use client";

import { useNav } from "@payloadcms/ui";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { groupedAdminModules } from "@/lib/admin-navigation";
import { BrandIcon } from "./BrandIcon";
import { SidebarLinks } from "./SidebarLinks";

export function SidebarNav({ groups }: { groups: ReturnType<typeof groupedAdminModules> }) {
  const { hydrated, navOpen, navRef, setNavOpen, shouldAnimate } = useNav();
  const pathname = usePathname();
  const classes = ["nav", "vx-sidebar", navOpen && "nav--nav-open", hydrated && "nav--nav-hydrated", shouldAnimate && "nav--nav-animate"].filter(Boolean).join(" ");
  return <aside className={classes} inert={!navOpen || undefined}>
    <div className="nav__scroll vx-sidebar-scroll" ref={navRef}>
      <div className="vx-sidebar-brand"><BrandIcon /><div><strong>VERTIX</strong><span>Admin workspace</span></div></div>
      <SidebarLinks groups={groups} pathname={pathname || "/admin"} />
    </div>
    <div className="nav__header"><div className="nav__header-content"><button className="nav__mobile-close" type="button" aria-label="Close navigation" onClick={() => setNavOpen(false)} tabIndex={navOpen ? undefined : -1}><X size={22} /></button></div></div>
  </aside>;
}
