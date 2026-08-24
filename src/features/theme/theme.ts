export const THEME_STORAGE_KEY = "gold-finger-theme-v1";

export const THEME_GROUPS = [
  { id: "pastel", label: "马卡龙配色" },
  { id: "business", label: "商务标准配色" },
] as const;

export const THEMES = [
  {
    id: "pastel-red",
    group: "pastel",
    label: "莓果红",
    colors: ["#f2d1d6", "#b75e6a", "#fcf3f4"],
  },
  {
    id: "pastel-pink",
    group: "pastel",
    label: "浅杏粉",
    colors: ["#f1ddd9", "#ad7d78", "#fbf6f4"],
  },
  {
    id: "pastel-yellow",
    group: "pastel",
    label: "奶油黄",
    colors: ["#f3e3ad", "#a87925", "#fcf8e9"],
  },
  {
    id: "pastel-green",
    group: "pastel",
    label: "薄荷绿",
    colors: ["#d3eadb", "#568f6a", "#f2f9f4"],
  },
  {
    id: "pastel-purple",
    group: "pastel",
    label: "鸢尾紫",
    colors: ["#e4ddf2", "#8e7eaa", "#f8f5fa"],
  },
  {
    id: "business-blue",
    group: "business",
    label: "专业蓝",
    colors: ["#dbe7f2", "#315f82", "#f3f6f8"],
  },
  {
    id: "business-slate",
    group: "business",
    label: "石墨灰",
    colors: ["#dfe3e8", "#4d5968", "#f4f5f7"],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "pastel-purple";

const THEME_IDS = new Set<string>(THEMES.map((theme) => theme.id));

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEME_IDS.has(value);
}
