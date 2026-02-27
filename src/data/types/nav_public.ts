export type NoChildNavItemType = {
    name: string;
    url: string;
}
export type NavItemType = NoChildNavItemType | {
    name: string;
    children: NoChildNavItemType[];
}