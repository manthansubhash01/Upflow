"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../dashboard.css";

type CalendarTask = {
  id: string;
  title: string;
  dueDate?: string;
  priority?: string;
  projectTitle?: string;
};

interface DashboardCalendarViewProps {
  tasks: CalendarTask[];
}

function isValidDate(value?: string): boolean {
  if (!value) {
    return false;
  }
  return !Number.isNaN(new Date(value).getTime());
}

export default function DashboardCalendarView({
  tasks,
}: DashboardCalendarViewProps) {
  const events = tasks
    .filter((task) => isValidDate(task.dueDate))
    .map((task) => ({
      id: task.id,
      title: task.title,
      date: task.dueDate,
      allDay: true,
      backgroundColor:
        task.priority === "HIGH"
          ? "#d97575"
          : task.priority === "MEDIUM"
            ? "#6b5bb5"
            : "#5ba3b8",
      borderColor: "transparent",
      textColor: "#ffffff",
      extendedProps: {
        projectTitle: task.projectTitle || "Workspace Task",
      },
    }));

  return (
    <div className="upflow-calendar rounded-2xl border border-[#e8e4f1] bg-white p-6 shadow-[0_8px_20px_rgba(43,45,92,0.06)]">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        contentHeight="auto"
        events={events}
        dayCellClassNames="fc-day-cell-custom"
        eventDidMount={(info) => {
          const projectTitle = String(
            info.event.extendedProps.projectTitle || "",
          );
          info.el.setAttribute(
            "title",
            `${projectTitle} - ${info.event.title}`,
          );
          info.el.classList.add("upflow-event");
        }}
      />
    </div>
  );
}
