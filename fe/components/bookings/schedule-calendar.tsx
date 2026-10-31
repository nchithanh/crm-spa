"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { Booking, Customer, TeamMember } from "@/lib/types";
import type { EventClickArg } from "@fullcalendar/core";

const STATUS_COLOR: Record<string, string> = {
  upcoming: "#38bdf8",
  confirmed: "#2563eb",
  in_service: "#7c3aed",
  completed: "#16a34a",
  cancelled: "#e11d48",
  rescheduled: "#d97706",
  no_show: "#ea580c",
};

export function ScheduleCalendar({
  bookings,
  customers,
  technicians,
  onSelect,
}: {
  bookings: Booking[];
  customers: Customer[];
  technicians: TeamMember[];
  onSelect: (bookingId: string) => void;
}) {
  const techName = (id?: string) =>
    technicians.find((t) => t.id === id)?.name ?? "";

  const events = bookings.map((b) => {
    const c = customers.find((x) => x.id === b.customerId);
    const mins = b.durationMinutes ?? 60;
    const endDate = new Date(Date.parse(b.scheduledAt) + mins * 60 * 1000);
    const tech = techName(b.technicianId);
    return {
      id: b.id,
      title: `${b.serviceName}${c ? ` · ${c.fullName}` : ""}${tech ? ` · ${tech}` : ""}`,
      start: b.scheduledAt,
      end: endDate.toISOString(),
      backgroundColor: STATUS_COLOR[b.status] ?? "#64748b",
      borderColor: "transparent",
    };
  });

  return (
    <div className="h-full min-h-[28rem] bg-white p-2">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate="2026-10-01"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        height="100%"
        locale="vi"
        nowIndicator
        editable={false}
        selectable={false}
        events={events}
        eventClick={(arg: EventClickArg) => {
          onSelect(arg.event.id);
        }}
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
        allDaySlot={false}
      />
    </div>
  );
}
