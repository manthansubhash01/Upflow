"use client";

import { useMemo } from "react";
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isValid,
  isBefore,
  startOfDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import type { TaskRecord } from "@/app/lib/workspaceApi";

type ProjectCalendarProps = {
  tasks: TaskRecord[];
  onOpenTask: (taskId: string) => void;
};

type CalendarEvent = Event & {
  resource: TaskRecord;
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

export default function ProjectCalendar({
  tasks,
  onOpenTask,
}: ProjectCalendarProps) {
  const events = useMemo<CalendarEvent[]>(() => {
    return tasks
      .filter((task) => Boolean(task.dueDate))
      .map((task) => {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        if (!dueDate || !isValid(dueDate)) {
          return null;
        }

        const event: CalendarEvent = {
          title: task.title,
          start: dueDate,
          end: dueDate,
          allDay: true,
          resource: task,
        };

        return event;
      })
      .filter((entry): entry is CalendarEvent => Boolean(entry));
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    const today = startOfDay(new Date());

    return [...tasks]
      .filter((task) => {
        if (!task.dueDate) {
          return false;
        }

        const dueDate = new Date(task.dueDate);
        return isValid(dueDate) && !isBefore(dueDate, today);
      })
      .sort((a, b) => {
        const left = new Date(a.dueDate || "").getTime();
        const right = new Date(b.dueDate || "").getTime();
        return left - right;
      })
      .slice(0, 5);
  }, [tasks]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource;
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue =
      dueDate &&
      isValid(dueDate) &&
      isBefore(dueDate, startOfDay(new Date())) &&
      task.status !== "DONE";

    let backgroundColor = "#6366f1";

    if (task.status === "DONE") {
      backgroundColor = "#22c55e";
    } else if (isOverdue) {
      backgroundColor = "#ef4444";
    } else if (task.status === "IN_PROGRESS") {
      backgroundColor = "#f59e0b";
    }

    return {
      style: {
        backgroundColor,
        border: "none",
        color: "#ffffff",
        borderRadius: "10px",
        padding: "2px 6px",
      },
    };
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
            Project Calendar
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
            Deadlines
          </h3>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
          {events.length === 0 ? (
            <div className="flex h-160 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
              No task deadlines yet. Add due dates to see them on the calendar.
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView="month"
              views={["month", "week", "day", "agenda"]}
              style={{ height: 640 }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) => onOpenTask(event.resource.id)}
            />
          )}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            Upcoming Deadlines
          </p>
          <div className="mt-3 space-y-2">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onOpenTask(task.id)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:border-violet-300"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {task.dueDate
                      ? format(new Date(task.dueDate), "MMM d, yyyy")
                      : "No due date"}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-500">No upcoming deadlines.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
