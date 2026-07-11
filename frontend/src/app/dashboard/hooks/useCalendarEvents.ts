import { useCallback, useState } from "react";
import type { CalendarEvent, PlacementEmail } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function useCalendarEvents(setError: (msg: string | null) => void) {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarEventsMap, setCalendarEventsMap] = useState<
    Record<string, string>
  >({});
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  const fetchCalendarEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/calendar/events?days=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.events) {
        setCalendarEvents(data.events);
        const map: Record<string, string> = {};
        data.events.forEach((e: CalendarEvent) => {
          if (e.isAuraMail) map[e.title] = e.id;
        });
        setCalendarEventsMap(map);
      }
    } catch {}
  }, []);

  const getEmailTitle = (email: PlacementEmail) =>
    email.company
      ? `${email.company}${email.role ? ` - ${email.role}` : ""}`
      : email.subject;

  const isInCalendar = (email: PlacementEmail) =>
    !!calendarEventsMap[getEmailTitle(email)] || !!calendarEventsMap[email.id];

  const addToCalendar = async (email: PlacementEmail) => {
    if (!email.deadline || isInCalendar(email)) return;
    setAddingToCalendar(true);
    try {
      const token = localStorage.getItem("accessToken");
      const title = getEmailTitle(email);
      const res = await fetch(`${API_URL}/calendar/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: email.summary || email.snippet,
          startTime: email.deadline.includes("T")
            ? email.deadline
            : `${email.deadline}T10:00:00`,
          location: email.location || "",
          emailId: email.id,
          company: email.company || "",
          role: email.role || "",
          eventType: "deadline",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCalendarEventsMap((prev) => ({
        ...prev,
        [title]: data.eventId,
        [email.id]: data.eventId,
      }));
      fetchCalendarEvents();
    } catch {
      setError("Failed to add to calendar");
    } finally {
      setAddingToCalendar(false);
    }
  };

  const removeFromCalendar = async (email: PlacementEmail) => {
    const eventId =
      calendarEventsMap[getEmailTitle(email)] || calendarEventsMap[email.id];
    if (!eventId) return;
    setAddingToCalendar(true);
    try {
      await fetch(`${API_URL}/calendar/events?eventId=${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setCalendarEventsMap((prev) => {
        const next = { ...prev };
        delete next[getEmailTitle(email)];
        delete next[email.id];
        return next;
      });
      fetchCalendarEvents();
    } catch {
      setError("Failed to remove from calendar");
    } finally {
      setAddingToCalendar(false);
    }
  };

  // Removes an AuraMail-added event directly by its Google Calendar event
  // ID, for the "My Events" list where there's no originating email object
  // at hand (just the raw calendar event).
  const removeEventById = async (eventId: string) => {
    setAddingToCalendar(true);
    const previous = calendarEvents;
    setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
    try {
      const res = await fetch(
        `${API_URL}/calendar/events?eventId=${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed");
      fetchCalendarEvents();
    } catch {
      setCalendarEvents(previous);
      setError("Failed to remove event");
    } finally {
      setAddingToCalendar(false);
    }
  };

  return {
    calendarEvents,
    calendarEventsMap,
    addingToCalendar,
    fetchCalendarEvents,
    getEmailTitle,
    isInCalendar,
    addToCalendar,
    removeFromCalendar,
    removeEventById,
  };
}
