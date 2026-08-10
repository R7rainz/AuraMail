import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PlacementEmail } from "../types";
import { announceChanges, detectChanges } from "../lib/emailChanges";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const POLL_INTERVAL_MS = 60_000;

export function useEmails(
  setError: (msg: string | null) => void,
  fetchCalendarEvents: () => Promise<void>,
  notificationsEnabled: boolean,
) {
  const [emails, setEmails] = useState<PlacementEmail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);
  const prevEmailsRef = useRef<PlacementEmail[]>([]);
  const hasFetchedOnceRef = useRef(false);
  const notificationsEnabledRef = useRef(notificationsEnabled);

  useEffect(() => {
    notificationsEnabledRef.current = notificationsEnabled;
  }, [notificationsEnabled]);

  const fetchEmails = useCallback(
    async (silent = false) => {
      if (!silent) setEmailsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/emails`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch emails");
        const data = await res.json();
        const nextEmails: PlacementEmail[] = data.emails || [];

        if (hasFetchedOnceRef.current && notificationsEnabledRef.current) {
          announceChanges(detectChanges(prevEmailsRef.current, nextEmails));
        }
        hasFetchedOnceRef.current = true;
        prevEmailsRef.current = nextEmails;

        setEmails(nextEmails);
      } catch {
        if (!silent) setError("Failed to load emails");
      } finally {
        if (!silent) setEmailsLoading(false);
      }
    },
    [setError],
  );

  // Poll for new/followup emails while the dashboard is open, skipping the
  // fetch when the tab is backgrounded to avoid unnecessary requests.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return;
      void fetchEmails(true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  const toggleImportant = useCallback(
    async (email: PlacementEmail) => {
      const next = !email.important;
      setEmails((prev) =>
        prev.map((e) =>
          e.gmailMessageId === email.gmailMessageId
            ? { ...e, important: next }
            : e,
        ),
      );
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `${API_URL}/emails/${email.gmailMessageId}/important`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ important: next }),
          },
        );
        if (!res.ok) throw new Error("Failed to update email");
      } catch {
        setEmails((prev) =>
          prev.map((e) =>
            e.gmailMessageId === email.gmailMessageId
              ? { ...e, important: !next }
              : e,
          ),
        );
        setError("Failed to update important flag");
      }
    },
    [setError],
  );

  const handleSync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/emails/sync`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Sync failed`);
      await fetchEmails(true);
      await fetchCalendarEvents();
      toast.success("Inbox is up to date");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync emails.");
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [fetchEmails, fetchCalendarEvents, setError]);

  return {
    emails,
    emailsLoading,
    syncing,
    fetchEmails,
    handleSync,
    toggleImportant,
  };
}
