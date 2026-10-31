"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { CornerDownLeft, Search, Sparkles, X } from "lucide-react";
import { NAV_GROUPS } from "@/lib/nav";
import { cn } from "@/lib/utils";

const OPEN_EVENT = "beauty:quick-search-open";

export function openQuickSearch() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type QuickEntry = {
  href: string;
  label: string;
  group: string;
  icon: LucideIcon;
  keywords: string;
};

/** Từ khoá phụ — gõ không dấu vẫn khớp */
const KEYWORDS: Record<string, string> = {
  "/": "trang chu dashboard bang dieu khien tong quan",
  "/insights": "phan tich khach insight kpi",
  "/today": "hoat dong hom nay viec hom nay",
  "/alerts": "canh bao co hoi",
  "/bookings": "dat lich hen calendar lich",
  "/packages": "lieu trinh goi buoi con lai",
  "/bookings/rebooking": "tai dat tai dat lich chua dat",
  "/customers": "khach hang danh ba danh sach",
  "/customers/new": "them khach tao khach khach moi",
  "/customers/import": "nhap xuat excel csv import",
  "/segments": "phan nhom segment tep khach",
  "/tasks": "viec can cham soc task todo",
  "/tasks/mine": "viec cua toi cong viec cua toi",
  "/care/birthdays": "sinh nhat chuc mung sinh nhat",
  "/care/inactive": "lau chua quay lai nguoi im lang",
  "/care/interactions": "lich su tuong tac goi dien",
  "/communication": "zalo gui tin nhan oa",
  "/communication/templates": "mau tin nhan template",
  "/automations": "workflow tu dong luong",
  "/campaigns": "chien dich chay chien dich",
  "/retention/at-risk": "nguy co roi at risk sap roi",
  "/retention/rebooking": "co hoi tai dat rebooking",
  "/retention/vip": "khach vip",
  "/reports": "bao cao thong ke",
  "/reports/retention": "ty le quay lai retention",
  "/finance": "cong no thanh toan pos vi",
  "/settings": "cai dat setting",
  "/settings/permissions": "phan quyen vai tro role",
  "/settings/zalo": "ket noi zalo oa",
  "/settings/team": "nhan vien team",
};

const ENTRIES: QuickEntry[] = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    href: item.href,
    label: item.label,
    group: group.label,
    icon: item.icon,
    keywords: KEYWORDS[item.href] ?? "",
  })),
);

const SUGGESTED = [
  "/bookings",
  "/customers/new",
  "/tasks",
  "/communication",
  "/care/birthdays",
  "/retention/at-risk",
];

function normalize(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function searchEntries(query: string): QuickEntry[] {
  const q = normalize(query.trim());
  if (!q) {
    const byHref = new Map(ENTRIES.map((e) => [e.href, e]));
    return SUGGESTED.map((href) => byHref.get(href)).filter(
      (e): e is QuickEntry => Boolean(e),
    );
  }
  const tokens = q.split(/\s+/);
  return ENTRIES.map((entry) => {
    const label = normalize(entry.label);
    const group = normalize(entry.group);
    const haystack = `${label} ${group} ${normalize(entry.keywords)} ${normalize(entry.href)}`;
    if (!tokens.every((t) => haystack.includes(t))) return null;
    let score = 0;
    if (label.startsWith(q)) score += 4;
    else if (label.includes(q)) score += 3;
    if (normalize(entry.keywords).includes(q)) score += 2;
    if (group.includes(q)) score += 1;
    return { entry, score };
  })
    .filter((x): x is { entry: QuickEntry; score: number } => Boolean(x))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((x) => x.entry);
}

export function QuickSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchEntries(query), [query]);

  useEffect(() => {
    setMounted(true);
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  const openDialog = () => {
    setQuery("");
    setActive(0);
    setOpen(true);
  };

  useEffect(() => {
    window.addEventListener(OPEN_EVENT, openDialog);
    return () => window.removeEventListener(OPEN_EVENT, openDialog);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setActive(0);
          }
          return !prev;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Pinch 2 ngón (iPad/mobile) để mở
  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    let startDistance = 0;
    let fired = false;
    const spread = (touches: TouchList) =>
      Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY,
      );
    const onTouchStart = (e: TouchEvent) => {
      fired = false;
      startDistance = e.touches.length === 2 ? spread(e.touches) : 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (fired || !startDistance || e.touches.length !== 2) return;
      e.preventDefault();
      if (spread(e.touches) < startDistance * 0.7) {
        fired = true;
        openDialog();
      }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[active];
      if (target) go(target.href);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label="Tìm nhanh chức năng, thao tác"
        title={`Tìm nhanh (${isMac ? "⌘K" : "Ctrl K"})`}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[var(--brand-50)] px-2.5 text-sm font-semibold text-[var(--brand-700)] hover:bg-[var(--brand-100)]"
      >
        <Sparkles size={16} />
        <span className="hidden sm:inline">Tìm nhanh</span>
        <kbd className="hidden rounded-md border border-[var(--border)] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 lg:inline">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex justify-center px-3">
            <button
              type="button"
              aria-label="Đóng tìm nhanh"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Tìm nhanh chức năng, thao tác"
              className="relative mt-[10vh] h-fit w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-2xl"
            >
              <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2.5">
                <Search size={18} className="shrink-0 text-[var(--brand-500)]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Tìm chức năng, thao tác…"
                  aria-label="Tìm chức năng, thao tác"
                  className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <span className="hidden items-center gap-1 rounded-full bg-[var(--brand-50)] px-2 py-0.5 text-[10px] font-bold text-[var(--brand-600)] sm:inline-flex">
                  <Sparkles size={10} />
                  AI
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Đóng"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div
                ref={listRef}
                role="listbox"
                aria-label="Kết quả"
                className="max-h-[min(60vh,26rem)] overflow-y-auto p-2"
              >
                {results.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-slate-500">
                    Không tìm thấy chức năng phù hợp.
                    <span className="mt-1 block text-xs text-slate-400">
                      Thử “sinh nhật”, “tái đặt”, “công nợ”…
                    </span>
                  </p>
                ) : (
                  <>
                    {!query.trim() ? (
                      <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                        Gợi ý nhanh
                      </p>
                    ) : null}
                    {results.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = index === active;
                      return (
                        <button
                          key={`${item.href}-${index}`}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          data-active={isActive}
                          onMouseEnter={() => setActive(index)}
                          onClick={() => go(item.href)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left",
                            isActive
                              ? "bg-[var(--brand-50)] text-[var(--brand-700)]"
                              : "text-slate-700 hover:bg-slate-50",
                          )}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--brand-600)] ring-1 ring-[var(--border)]">
                            <Icon size={16} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {item.label}
                          </span>
                          <span className="hidden shrink-0 text-[10px] font-semibold tracking-wide text-slate-400 uppercase sm:block">
                            {item.group}
                          </span>
                          {isActive ? (
                            <CornerDownLeft
                              size={14}
                              className="shrink-0 text-[var(--brand-500)]"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] px-3 py-2 text-[11px] text-slate-400">
                <span>↑ ↓ chọn · Enter mở · Esc đóng</span>
                <span className="hidden sm:inline">Tìm cục bộ · mock</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
