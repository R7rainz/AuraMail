"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/authContext";
import { updateNotificationPreference } from "@/app/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, LogOut, RefreshCw, AlertTriangle, X, Bell, BellOff } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

import type { PlacementEmail } from "./types";
import { getDaysDiff } from "./lib/dateUtils";
import { useEmails } from "./hooks/useEmails";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { useEmailFilters } from "./hooks/useEmailFilters";
import { InboxSidebar } from "./components/InboxSidebar";
import { EmailDetailView } from "./components/EmailDetailView";
import { DashboardOverview } from "./components/DashboardOverview";
import { CalendarPanel } from "./components/CalendarPanel";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<PlacementEmail | null>(
    null,
  );
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [syncedUserID, setSyncedUserID] = useState<string | null>(null);

  // Sync local toggle state from the loaded user once, the first time the
  // user becomes available (not via an effect, to avoid an extra render).
  if (user && user.id !== syncedUserID) {
    setSyncedUserID(user.id);
    setNotificationsEnabled(user.notificationsEnabled ?? true);
  }

  const toggleNotifications = async () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    const ok = await updateNotificationPreference(next);
    if (!ok) {
      setNotificationsEnabled(!next);
      setError("Failed to update notification preference");
    }
  };

  const calendar = useCalendarEvents(setError);
  const {
    emails,
    emailsLoading,
    syncing,
    fetchEmails,
    handleSync,
    toggleImportant,
  } = useEmails(setError, calendar.fetchCalendarEvents, notificationsEnabled);
  const filters = useEmailFilters(emails);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
      return;
    }

    if (!user) return;

    const timeoutID = window.setTimeout(() => {
      void fetchEmails();
      void calendar.fetchCalendarEvents();
    }, 0);

    return () => window.clearTimeout(timeoutID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router]);

  const upcomingDeadlinesCount = useMemo(
    () => emails.filter((e) => e.deadline && getDaysDiff(e.deadline) >= -1).length,
    [emails],
  );
  const highPriorityCount = emails.filter((e) => e.priority === "high").length;

  // Re-derive the selected email from the live `emails` list (rather than
  // trusting the snapshot captured at selection time) so toggling
  // "important" is reflected immediately in the detail view too.
  const liveSelectedEmail = selectedEmail
    ? emails.find((e) => e.gmailMessageId === selectedEmail.gmailMessageId) ||
      selectedEmail
    : null;

  if (loading) {
    return (
      <div className="aura-shell min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-t-2 border-l-2 border-[var(--aura-accent-strong)] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="aura-shell flex flex-col h-screen overflow-hidden font-sans">
      <Toaster position="top-right" />
      {/* HEADER */}
      <header className="aura-panel h-16 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 backdrop-blur-xl z-20 relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="aura-surface relative flex items-center justify-center w-8 h-8 border shadow-[0_0_18px_var(--aura-glow)]">
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--aura-accent)] animate-pulse" />
              <Mail className="w-4 h-4 aura-accent" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              AuraMail
            </span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <span className="hidden items-center gap-2 text-xs font-medium uppercase aura-muted sm:flex">
            <span
              className={`status-dot ${syncing ? "status-dot--syncing" : error ? "status-dot--error" : "status-dot--online"}`}
            />
            {syncing ? "Syncing" : error ? "Sync error" : "Live"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle compact />
          <button
            onClick={toggleNotifications}
            title={
              notificationsEnabled
                ? "Notifications on — click to mute"
                : "Notifications off — click to enable"
            }
            className={`aura-hover-glow p-2 rounded-lg border transition-all hover:scale-105 active:scale-95 ${notificationsEnabled ? "bg-white/5 border-white/10 text-gray-300 hover:text-white" : "bg-white/5 border-white/10 text-gray-600 hover:text-gray-400"}`}
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="aura-hover-glow flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:scale-[1.03] active:scale-95 disabled:hover:scale-100 group"
          >
            <RefreshCw
              className={`w-4 h-4 text-[var(--aura-accent)] group-hover:text-[var(--aura-accent-strong)] ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync"}
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-white/10 bg-gradient-to-br from-[var(--aura-accent)]/20 to-[var(--aura-secondary)]/20 text-[var(--aura-text)] shadow-inner transition-shadow hover:shadow-[0_0_16px_-2px_var(--aura-glow)]">
            {user.name?.charAt(0) || "U"}
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-rose-300 transition-all hover:scale-105 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ERROR BANNER */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl flex items-center gap-3 border border-rose-500/30 bg-rose-500/10 backdrop-blur-md text-sm text-rose-200 shadow-2xl"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN 3-COLUMN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* COLUMN 1: INBOX LIST (Fixed Width) */}
        <InboxSidebar
          searchQuery={filters.searchQuery}
          setSearchQuery={filters.setSearchQuery}
          showSortDropdown={showSortDropdown}
          setShowSortDropdown={setShowSortDropdown}
          sortBy={filters.sortBy}
          setSortBy={filters.setSortBy}
          sortDirection={filters.sortDirection}
          setSortDirection={filters.setSortDirection}
          selectedCategory={filters.selectedCategory}
          setSelectedCategory={filters.setSelectedCategory}
          categoryCounts={filters.categoryCounts}
          showImportantOnly={filters.showImportantOnly}
          setShowImportantOnly={filters.setShowImportantOnly}
          importantCount={filters.importantCount}
          onToggleImportant={toggleImportant}
          emailsLoading={emailsLoading}
          filteredEmails={filters.filteredEmails}
          selectedEmail={selectedEmail}
          setSelectedEmail={setSelectedEmail}
        />

        {/* COLUMN 2: CENTER WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-[var(--aura-canvas-raised)]/75 backdrop-blur-2xl overflow-hidden">
          <div className="absolute inset-0 aura-grid pointer-events-none opacity-20" />

          <AnimatePresence mode="wait">
            {liveSelectedEmail ? (
              <EmailDetailView
                key="detail"
                email={liveSelectedEmail}
                onBack={() => setSelectedEmail(null)}
                inCalendar={calendar.isInCalendar(liveSelectedEmail)}
                addingToCalendar={calendar.addingToCalendar}
                onAddToCalendar={() =>
                  calendar.addToCalendar(liveSelectedEmail)
                }
                onRemoveFromCalendar={() =>
                  calendar.removeFromCalendar(liveSelectedEmail)
                }
                onToggleImportant={() =>
                  toggleImportant(liveSelectedEmail)
                }
              />
            ) : (
              <DashboardOverview
                key="dashboard"
                userFirstName={user.name?.split(" ")[0] || ""}
                totalEmails={emails.length}
                highPriorityCount={highPriorityCount}
                upcomingDeadlinesCount={upcomingDeadlinesCount}
              />
            )}
          </AnimatePresence>
        </div>

        {/* COLUMN 3: RIGHT CALENDAR PANEL */}
        <CalendarPanel
          emails={emails}
          calendarEvents={calendar.calendarEvents}
          onRemoveEvent={calendar.removeEventById}
        />
      </div>

      {/* Global CSS for transparent modern scrollbars */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.2); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
