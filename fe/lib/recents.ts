import { NAV_GROUPS, NAV_ITEMS, type NavItem } from "@/lib/nav";

const STORAGE_KEY = "beauty-recent-nav";
const MAX_RECENTS = 15;
const PER_COLUMN = 5;

export type RecentFeature = {
  href: string;
  label: string;
  groupId: string;
  icon: NavItem["icon"];
};

export type RecentColumn = {
  id: string;
  title: string;
  items: RecentFeature[];
};

/** 3 lĩnh vực chính của dashboard */
const COLUMNS: { id: string; title: string; defaults: string[] }[] = [
  {
    id: "customers",
    title: "Khách hàng",
    defaults: [
      "/customers",
      "/customers/leads",
      "/segments",
      "/customers/tags",
      "/customers/sources",
    ],
  },
  {
    id: "ops",
    title: "Lịch hẹn & Dịch vụ",
    defaults: [
      "/bookings",
      "/bookings/history",
      "/packages",
      "/services",
      "/bookings/rebooking",
    ],
  },
  {
    id: "care",
    title: "Chăm sóc KH",
    defaults: [
      "/tasks",
      "/care",
      "/care/birthdays",
      "/care/inactive",
      "/tasks/mine",
    ],
  },
];

const itemByHref = new Map(NAV_ITEMS.map((item) => [item.href, item]));
const groupByHref = new Map(
  NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => [item.href, group.id] as const),
  ),
);

function toFeature(href: string): RecentFeature | null {
  const item = itemByHref.get(href);
  const groupId = groupByHref.get(href);
  if (!item || !groupId) return null;
  return { href, label: item.label, groupId, icon: item.icon };
}

function readHrefs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((href): href is string => typeof href === "string")
      : [];
  } catch {
    return [];
  }
}

/** Pathname → nav href (gộp route con /[id] về mục nav gần nhất). */
export function navHrefFor(pathname: string): string | null {
  if (!pathname || pathname === "/" || pathname === "/menu") return null;
  const matches = NAV_ITEMS.filter(
    (item) =>
      item.href !== "/" &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  ).sort((a, b) => b.href.length - a.href.length);
  return matches[0]?.href ?? null;
}

export function pushRecent(href: string) {
  if (typeof window === "undefined") return;
  const next = [
    href,
    ...readHrefs().filter((item) => item !== href),
  ].slice(0, MAX_RECENTS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getRecentColumns(): {
  columns: RecentColumn[];
  isFallback: boolean;
} {
  const recents = readHrefs()
    .map(toFeature)
    .filter((item): item is RecentFeature => Boolean(item));

  const columns = COLUMNS.map((column) => {
    const seen = new Set<string>();
    const items: RecentFeature[] = [];
    const candidates = [
      ...recents,
      ...column.defaults
        .map(toFeature)
        .filter((item): item is RecentFeature => Boolean(item)),
    ];
    for (const feature of candidates) {
      if (items.length >= PER_COLUMN) break;
      if (feature.groupId !== column.id || seen.has(feature.href)) continue;
      seen.add(feature.href);
      items.push(feature);
    }
    return { id: column.id, title: column.title, items };
  });

  const isFallback = !recents.some((feature) =>
    COLUMNS.some((column) => column.id === feature.groupId),
  );

  return { columns, isFallback };
}
