import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CalendarEvent, PlacementEmail } from "../types";
import { getDaysDiff } from "../lib/dateUtils";

interface CalendarPanelProps {
  emails: PlacementEmail[];
  calendarEvents: CalendarEvent[];
}

interface CalendarDay {
  date: number;
  fullDateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasDeadline: boolean;
  hasEvent: boolean;
}

function getCalendarDays(
  currentMonth: Date,
  emails: PlacementEmail[],
  calendarEvents: CalendarEvent[],
): CalendarDay[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days: CalendarDay[] = [];
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  for (let i = startingDay - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    let pM = month - 1,
      pY = year;
    if (pM < 0) {
      pM = 11;
      pY--;
    }
    days.push({
      date: d,
      fullDateStr: `${pY}-${String(pM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      isCurrentMonth: false,
      isToday: false,
      hasDeadline: false,
      hasEvent: false,
    });
  }

  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    days.push({
      date: i,
      fullDateStr: dateStr,
      isCurrentMonth: true,
      isToday:
        today.getDate() === i &&
        today.getMonth() === month &&
        today.getFullYear() === year,
      hasDeadline: emails.some((e) => e.deadline?.startsWith(dateStr)),
      hasEvent: calendarEvents.some((e) => e.startTime.startsWith(dateStr)),
    });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    let nM = month + 1,
      nY = year;
    if (nM > 11) {
      nM = 0;
      nY++;
    }
    days.push({
      date: i,
      fullDateStr: `${nY}-${String(nM + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      isCurrentMonth: false,
      isToday: false,
      hasDeadline: false,
      hasEvent: false,
    });
  }
  return days;
}

export function CalendarPanel({ emails, calendarEvents }: CalendarPanelProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    string | null
  >(null);

  const navigateMonth = (dir: number) =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + dir, 1),
    );

  const activeFocusDate = hoveredDate || selectedCalendarDate;
  const activeDateEvents = useMemo(() => {
    if (!activeFocusDate) return { events: [], deadlines: [] };
    return {
      events: calendarEvents.filter((e) =>
        e.startTime.startsWith(activeFocusDate),
      ),
      deadlines: emails.filter((e) => e.deadline?.startsWith(activeFocusDate)),
    };
  }, [activeFocusDate, calendarEvents, emails]);

  const upcomingEvents = useMemo(() => {
    return calendarEvents
      .filter((e) => {
        const days = getDaysDiff(e.startTime);
        return days >= 0 && days <= 7;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
      .slice(0, 5);
  }, [calendarEvents]);

  const calendarDays = getCalendarDays(currentMonth, emails, calendarEvents);

  return (
    <aside className="hidden w-[320px] shrink-0 flex-col border-l bg-card 2xl:flex">
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {currentMonth.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigateMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigateMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="mb-1 grid grid-cols-7">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              className="text-center font-mono text-[10px] text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, i) => {
            const isFocused =
              hoveredDate === day.fullDateStr ||
              selectedCalendarDate === day.fullDateStr;
            return (
              <button
                key={i}
                onMouseEnter={() => setHoveredDate(day.fullDateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                onFocus={() => setHoveredDate(day.fullDateStr)}
                onBlur={() => setHoveredDate(null)}
                onClick={() =>
                  setSelectedCalendarDate(
                    selectedCalendarDate === day.fullDateStr
                      ? null
                      : day.fullDateStr,
                  )
                }
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-md font-mono text-xs transition-colors outline-none",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  !day.isCurrentMonth && "text-muted-foreground/40",
                  day.isToday && !isFocused && "font-semibold text-primary",
                  isFocused
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent",
                )}
              >
                {day.date}
                {(day.hasDeadline || day.hasEvent) && !isFocused && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {day.hasDeadline && (
                      <span className="size-1 rounded-full bg-soon" />
                    )}
                    {day.hasEvent && (
                      <span className="size-1 rounded-full bg-primary" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeFocusDate ? (
            <motion.div
              key="focus"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  {new Date(activeFocusDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                {selectedCalendarDate && <Badge variant="secondary">Pinned</Badge>}
              </div>

              {activeDateEvents.events.length === 0 &&
              activeDateEvents.deadlines.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nothing scheduled.
                </p>
              ) : (
                <div className="space-y-5">
                  {activeDateEvents.deadlines.length > 0 && (
                    <section>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-soon">
                        <Clock className="size-3.5" />
                        Deadlines
                      </p>
                      <div className="space-y-1.5">
                        {activeDateEvents.deadlines.map((dl) => (
                          <div key={dl.id} className="rounded-lg border p-3">
                            <p className="truncate text-sm font-medium">
                              {dl.company || dl.subject}
                            </p>
                            {dl.role && (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {dl.role}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {activeDateEvents.events.length > 0 && (
                    <section>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                        <CalendarCheck className="size-3.5" />
                        Events
                      </p>
                      <div className="space-y-1.5">
                        {activeDateEvents.events.map((ev) => (
                          <div key={ev.id} className="rounded-lg border p-3">
                            <p className="truncate text-sm font-medium">
                              {ev.title}
                            </p>
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                              {new Date(ev.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <h3 className="mb-4 text-sm font-semibold">Next 7 days</h3>

              {upcomingEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Your week is clear.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.startTime);
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-md bg-muted font-mono">
                          <span className="text-[9px] text-muted-foreground uppercase">
                            {eventDate.toLocaleDateString(undefined, {
                              month: "short",
                            })}
                          </span>
                          <span className="text-sm font-medium">
                            {eventDate.getDate()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {event.title}
                          </p>
                          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                            {eventDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
