"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, MessageSquare, Plus, UserPlus, X } from "lucide-react";

const ACTIONS = [
  {
    href: "/bookings?new=1",
    label: "Đặt lịch",
    icon: CalendarDays,
  },
  {
    href: "/communication",
    label: "Gửi Zalo",
    icon: MessageSquare,
  },
  {
    href: "/customers/new",
    label: "Khách mới",
    icon: UserPlus,
  },
] as const;

export function QuickCreate() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

  const onAction = (e: MouseEvent, href: string) => {
    if (href === "/bookings?new=1" && pathname.startsWith("/bookings")) {
      e.preventDefault();
      window.dispatchEvent(new Event("beauty:new-booking"));
    }
    close();
  };

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tạo mới"
        title="Tạo mới"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-500)] text-white hover:bg-[var(--brand-600)] lg:hidden"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              aria-label="Đóng tạo mới"
              onClick={close}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Tạo mới"
              className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-[var(--border)] bg-white pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl"
            >
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-200" />
              <div className="flex items-center justify-between px-4 pt-2">
                <h2 className="text-base font-bold text-slate-900">Tạo mới</h2>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Đóng"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 px-4 pt-1 pb-2">
                {ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      onClick={(e) => onAction(e, action.href)}
                      className="flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-center hover:bg-[var(--brand-50)]"
                    >
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--brand-50)] text-[var(--brand-600)]">
                        <Icon size={22} strokeWidth={1.75} />
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {action.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
