"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { MOBILE_DOCK, isNavActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileBottomDock({ tasksBadge = 0 }: { tasksBadge?: number }) {
  const pathname = usePathname();
  const center = MOBILE_DOCK.center;
  const CenterIcon = center.icon;
  const centerActive = isNavActive(center.href, pathname);
  const MenuIcon = MOBILE_DOCK.menu.icon;
  const menuActive = isNavActive(MOBILE_DOCK.menu.href, pathname);

  return (
    <div
      className={cn(
        "beauty-mobile-chrome fixed inset-x-0 z-40 lg:hidden",
        "bottom-[max(1.35rem,calc(env(safe-area-inset-bottom)+0.6rem))]",
      )}
    >
      <nav
        id="mobile-bottom-nav"
        aria-label="Điều hướng chính"
        className="pointer-events-none relative px-3"
      >
        <div className="pointer-events-auto relative mx-auto max-w-lg pt-9">
          <Link
            href={center.href}
            aria-label={center.label}
            className={cn(
              "absolute top-0 left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-white transition",
              "shadow-[0_6px_18px_rgba(93,92,196,0.42)]",
              centerActive
                ? "bg-[var(--brand-600)]"
                : "bg-[var(--brand-500)]",
            )}
          >
            <CenterIcon size={22} strokeWidth={2} className="text-white" />
          </Link>

          <div className="relative drop-shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
            <div
              className={cn(
                "beauty-mobile-dock-pill relative flex h-[3.85rem] items-end rounded-full border border-[var(--border)] bg-[var(--card)] px-1.5 pb-1 backdrop-blur-md",
                "beauty-mobile-dock-pill--notch",
              )}
            >
              <div className="grid h-full w-full grid-cols-5 items-stretch gap-0">
                {MOBILE_DOCK.left.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(item.href, pathname);
                  const isHome = item.href === "/";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1",
                        active ? "text-[var(--brand-600)]" : "text-slate-400",
                      )}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {isHome ? (
                          <BrandMark className="h-5 w-5" />
                        ) : (
                          <Icon size={20} strokeWidth={2} />
                        )}
                      </span>
                      <span className="h-3.5 w-full truncate text-center text-[10px] leading-none font-medium">
                        {item.mobileLabel ?? item.label}
                      </span>
                    </Link>
                  );
                })}

                <div className="flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1">
                  <span className="h-5 w-5 shrink-0" aria-hidden />
                  <span
                    className={cn(
                      "h-3.5 w-full truncate text-center text-[10px] leading-none font-medium",
                      centerActive ? "text-[var(--brand-600)]" : "text-slate-400",
                    )}
                  >
                    {center.mobileLabel ?? center.label}
                  </span>
                </div>

                {MOBILE_DOCK.right.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(item.href, pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1",
                        active ? "text-[var(--brand-600)]" : "text-slate-400",
                      )}
                    >
                      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <Icon size={20} strokeWidth={2} />
                        {item.href === "/tasks" && tasksBadge > 0 ? (
                          <span className="absolute -top-1.5 -right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-500)] px-1 text-[9px] font-bold text-white">
                            {tasksBadge > 9 ? "9+" : tasksBadge}
                          </span>
                        ) : null}
                      </span>
                      <span className="h-3.5 w-full truncate text-center text-[10px] leading-none font-medium">
                        {item.mobileLabel ?? item.label}
                      </span>
                    </Link>
                  );
                })}

                <Link
                  href={MOBILE_DOCK.menu.href}
                  className={cn(
                    "flex h-full flex-col items-center justify-end gap-0.5 px-0.5 pb-1",
                    menuActive ? "text-[var(--brand-600)]" : "text-slate-400",
                  )}
                  aria-label="Menu"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <MenuIcon size={20} strokeWidth={2} />
                  </span>
                  <span className="h-3.5 w-full truncate text-center text-[10px] leading-none font-medium">
                    {MOBILE_DOCK.menu.mobileLabel}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
