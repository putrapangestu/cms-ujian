import type { RoleType } from "./Role";
import type { Icon } from "@tabler/icons-react";

export type SidebarItemType = { label: string, url: string, hasAccess?: RoleType[] }
export type SidebarAdminType = {
    label: string;
    children: (SidebarItemType & { icon: Icon, children?: SidebarItemType[] })[]
}