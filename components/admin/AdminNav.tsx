import type { SanitizedPermissions, VisibleEntities } from "payload";
import { groupedAdminModules } from "@/lib/admin-navigation";
import { SidebarNav } from "./SidebarNav";

export function AdminNav({ permissions = {}, visibleEntities }: { permissions?: SanitizedPermissions; visibleEntities?: VisibleEntities }) {
  const groups = groupedAdminModules(permissions).map(group => ({
    ...group,
    modules: group.modules.filter(module => !visibleEntities || ("global" in module
      ? visibleEntities.globals.includes(module.slug)
      : visibleEntities.collections.includes(module.slug))),
  })).filter(group => group.modules.length > 0);
  return <SidebarNav groups={groups} />;
}
