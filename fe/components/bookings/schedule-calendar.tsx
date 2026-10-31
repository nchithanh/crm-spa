"use client";

import { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarApi, EventClickArg } from "@fullcalendar/core";
import type { Booking, Customer, TeamMember } from "@/lib/types";

export type CalendarView = "timeGridDay" | "timeGridWeek" | "dayGridMonth";

const STATUS_COLOR: Record<string, string> = {
  upcoming: "#38bdf8",
  confirmed: "#5d5cc4",
  in_service: "#7c3aed",
  completed: "#16a34a",
  cancelled: "#e11d48",
  rescheduled: "#d97706",
  no_show: "#ea580c",
};

function hhmm(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function ScheduleCalendar({
  view,
  bookings,
  customers,
  onSelect,
  onApi,
  onTitle,
}: {
  view: CalendarView;
  bookings: Booking[];
  customers: Customer[];
  technicians: TeamMember[];
  onSelect: (bookingId: string) => void;
  onApi?: (api: CalendarApi) => void;
  onTitle?: (title: string) => void;
}) {
  const ref = useRef<FullCalendar>(null);

  const events = bookings.map((b) => {
    const c = customers.find((x) => x.id === b.customerId);
    const mins = b.durationMinutes ?? 60;
    const endDate = new Date(Date.parse(b.scheduledAt) + mins * 60 * 1000);
    const name = c?.fullName ?? b.serviceName;
    return {
      id: b.id,
      title: `${hhmm(b.scheduledAt)} · ${name}`,
      start: b.scheduledAt,
      end: endDate.toISOString(),
      backgroundColor: STATUS_COLOR[b.status] ?? "#64748b",
      borderColor: "transparent",
    };
  });

  return (
    <div className="h-full min-h-[28rem] bg-white p-2 pt-0">
      <FullCalendar
        key={view}
        ref={ref}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        headerToolbar={false}
        height="100%"
        locale="vi"
        nowIndicator
        editable={false}
        selectable={false}
        events={events}
        datesSet={(arg) => {
          onApi?.(arg.view.calendar);
          onTitle?.(arg.view.title);
        }}
        eventClick={(arg: EventClickArg) => {
          onSelect(arg.event.id);
        }}
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
        allDaySlot={false}
        dayMaxEvents={3}
        moreLinkClick="popover"
        moreLinkText={(n) => `+${n}`}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        displayEventTime={false}
        eventContent={(arg) => (
          <div className="truncate px-0.5 text-[10px] font-semibold leading-tight text-white">
            {arg.event.title}
          </div>
        )}
      />
    </div>
  );
}
