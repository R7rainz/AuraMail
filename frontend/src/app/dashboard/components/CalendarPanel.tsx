import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CalendarCheck,
  MapPin,
  ExternalLink,
  Trash2,
  CalendarX,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { CalendarEvent, PlacementEmail } from "../types";
import { getDaysDiff } from "../lib/dateUtils";

interface CalendarPanelProps {
  emails: PlacementEmail[];
  calendarEvents: CalendarEvent[];
  onRemoveEvent: (eventId: string) => void;
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

export function CalendarPanel({
  emails,
  calendarEvents,
  onRemoveEvent,
}: CalendarPanelProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    string | null
  >(null);

  const myEvents = useMemo(
    () =>
      calendarEvents
        .filter((e) => e.isAuraMail)
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
    [calendarEvents],
  );

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
      .slice(0, 4);
  }, [calendarEvents]);

  const calendarDays = getCalendarDays(currentMonth, emails, calendarEvents);

  return (
    <div className="aura-panel hidden w-[320px] border-l flex-col shrink-0 z-20 2xl:flex">
      <Tabs defaultValue="month" className="flex-1 min-h-0 gap-0">
        <div className="p-3 border-b">
          <TabsList className="w-full">
            <TabsTrigger value="month" className="gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Calendar
            </TabsTrigger>
            <TabsTrigger value="mine" className="gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5" /> My Events
              {myEvents.length > 0 && (
                <Badge
                  variant="secondary"
                  className="h-4 min-w-4 rounded-full px-1 text-[9px] leading-none"
                >
                  {myEvents.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="month" className="flex flex-col min-h-0 m-0">
      {/* Calendar Header */}
      <div className="p-5 border-b backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-[var(--aura-text)]">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => navigateMonth(-1)}
              className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-90 text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-90 text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              className="text-center text-[10px] font-bold text-gray-600"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, i) => {
            const isActiveVisual =
              hoveredDate === day.fullDateStr ||
              selectedCalendarDate === day.fullDateStr;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredDate(day.fullDateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                onClick={() =>
                  setSelectedCalendarDate(
                    selectedCalendarDate === day.fullDateStr
                      ? null
                      : day.fullDateStr,
                  )
                }
                className={`aspect-square flex items-center justify-center text-xs rounded-lg relative cursor-pointer transition-all duration-300 ease-out
                  ${isActiveVisual ? "scale-[1.15] z-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "border border-transparent hover:bg-white/5"}
                  ${day.isToday && !isActiveVisual ? "bg-white/10 border-white/20 text-white font-bold" : ""}
                  ${!day.isCurrentMonth && !isActiveVisual ? "text-gray-700" : !isActiveVisual && !day.isToday ? "text-gray-400" : ""}
                `}
              >
                {day.date}
                {/* Event Dots */}
                {(day.hasDeadline || day.hasEvent) && !isActiveVisual && (
                  <div className="absolute bottom-1.5 flex gap-1">
                    {day.hasDeadline && (
                      <div className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                    )}
                    {day.hasEvent && (
                      <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Feed underneath */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-transparent">
        <AnimatePresence mode="wait">
          {activeFocusDate ? (
            <motion.div
              key="focus"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
                <h3 className="text-sm font-semibold text-white">
                  {new Date(activeFocusDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                {selectedCalendarDate && (
                  <span className="text-[10px] font-medium tracking-wide uppercase bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                    Locked
                  </span>
                )}
              </div>

              {activeDateEvents.events.length === 0 &&
              activeDateEvents.deadlines.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-6">
                  No scheduled items.
                </p>
              ) : (
                <div className="space-y-6">
                  {activeDateEvents.deadlines.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-amber-500 font-bold mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Deadlines
                      </p>
                      <div className="space-y-2">
                        {activeDateEvents.deadlines.map((dl) => (
                          <div
                            key={dl.id}
                            className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]"
                          >
                            <p className="text-sm font-semibold text-white truncate">
                              {dl.company || dl.subject}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {dl.role}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeDateEvents.events.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-3 flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5" /> Events
                      </p>
                      <div className="space-y-2">
                        {activeDateEvents.events.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]"
                          >
                            <p className="text-sm font-semibold text-white truncate">
                              {ev.title}
                            </p>
                            <p className="text-xs text-blue-300 mt-1 font-medium">
                              {new Date(ev.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="general"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-5 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Next 7 Days
              </h3>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-600">
                    Your schedule is clear.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.startTime);
                    return (
                      <div
                        key={event.id}
                        className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group cursor-default"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-gray-300 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">
                            <span className="text-[10px] font-medium leading-none mb-1 uppercase tracking-wider">
                              {eventDate.toLocaleDateString("en-US", {
                                month: "short",
                              })}
                            </span>
                            <span className="text-sm font-bold leading-none">
                              {eventDate.getDate()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                              {event.title}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {eventDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
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
        </TabsContent>

        <TabsContent
          value="mine"
          className="min-h-0 overflow-y-auto custom-scrollbar p-4 m-0"
        >
          {myEvents.length === 0 ? (
            <div className="text-center py-16 px-4">
              <CalendarX className="w-9 h-9 mx-auto mb-4 opacity-20 text-gray-400" />
              <p className="text-sm text-gray-500">
                No events added yet.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Add a deadline to your calendar from any email to see it
                here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myEvents.map((event) => {
                const eventDate = new Date(event.startTime);
                const isPast = getDaysDiff(event.startTime) < 0;
                return (
                  <div
                    key={event.id}
                    className={`group relative p-4 rounded-xl border bg-white/[0.02] transition-all hover:bg-white/[0.05] ${isPast ? "border-white/5 opacity-50" : "border-white/5 hover:border-[var(--aura-line-strong)]"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center w-10 h-10 shrink-0 rounded-lg bg-[var(--aura-accent-soft)] border border-[var(--aura-line)] text-[var(--aura-accent)]">
                        <span className="text-[10px] font-medium leading-none mb-1 uppercase tracking-wider">
                          {eventDate.toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </span>
                        <span className="text-sm font-bold leading-none">
                          {eventDate.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate pr-6">
                          {event.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <Clock className="w-3 h-3 shrink-0" />
                          {eventDate.toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                        {event.location && (
                          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </p>
                        )}
                        {event.link && (
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[var(--aura-accent)] mt-1 flex items-center gap-1.5 hover:underline w-fit"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" /> Open
                            link
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveEvent(event.id)}
                      title="Remove from calendar"
                      aria-label="Remove from calendar"
                      className="absolute top-3 right-3 p-1 rounded-md text-gray-600 opacity-0 group-hover:opacity-100 transition-all hover:text-rose-400 hover:scale-110 active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
