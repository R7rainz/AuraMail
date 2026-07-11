import type { Dispatch, SetStateAction } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Inbox,
  Zap,
  Clock,
  MessagesSquare,
  Paperclip,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  categoryConfig,
  sortOptions,
  type EmailCategory,
  type PlacementEmail,
  type SortDirection,
  type SortOption,
} from "../types";
import { formatDeadline, formatRelativeDate } from "../lib/dateUtils";

interface InboxSidebarProps {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  showSortDropdown: boolean;
  setShowSortDropdown: Dispatch<SetStateAction<boolean>>;
  sortBy: SortOption;
  setSortBy: Dispatch<SetStateAction<SortOption>>;
  sortDirection: SortDirection;
  setSortDirection: Dispatch<SetStateAction<SortDirection>>;
  selectedCategory: EmailCategory;
  setSelectedCategory: Dispatch<SetStateAction<EmailCategory>>;
  categoryCounts: Record<string, number>;
  showImportantOnly: boolean;
  setShowImportantOnly: Dispatch<SetStateAction<boolean>>;
  importantCount: number;
  onToggleImportant: (email: PlacementEmail) => void;
  emailsLoading: boolean;
  filteredEmails: PlacementEmail[];
  selectedEmail: PlacementEmail | null;
  setSelectedEmail: Dispatch<SetStateAction<PlacementEmail | null>>;
}

export function InboxSidebar({
  searchQuery,
  setSearchQuery,
  showSortDropdown,
  setShowSortDropdown,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  selectedCategory,
  setSelectedCategory,
  categoryCounts,
  showImportantOnly,
  setShowImportantOnly,
  importantCount,
  onToggleImportant,
  emailsLoading,
  filteredEmails,
  selectedEmail,
  setSelectedEmail,
}: InboxSidebarProps) {
  return (
    <div className="aura-panel w-[340px] xl:w-[380px] flex flex-col border-r shrink-0 z-10">
      {/* Search & Filters */}
      <div className="p-4 xl:p-5 space-y-4 border-b backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[var(--aura-accent)] transition-colors" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--aura-surface-solid)] border text-[var(--aura-text)] placeholder:text-[var(--aura-faint)] outline-none transition-all focus:border-[var(--aura-accent)] focus:shadow-[0_0_0_3px_var(--aura-accent-soft)]"
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowImportantOnly((prev) => !prev)}
                aria-pressed={showImportantOnly}
                className={`relative h-full px-3 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${showImportantOnly ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_14px_-4px_rgba(245,158,11,0.5)]" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300"}`}
              >
                <Star
                  className="w-4 h-4"
                  fill={showImportantOnly ? "currentColor" : "none"}
                />
                {importantCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full px-1 text-[9px] leading-none"
                  >
                    {importantCount}
                  </Badge>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>Important only</TooltipContent>
          </Tooltip>
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`h-full px-3 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${showSortDropdown ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300"}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[var(--aura-surface-solid)] shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sortBy === opt.value ? "bg-[var(--aura-accent-soft)] text-[var(--aura-accent)]" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                  >
                    {opt.label}
                    {sortBy === opt.value && (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                ))}
                <div className="h-px bg-white/10" />
                <button
                  onClick={() =>
                    setSortDirection((prev) =>
                      prev === "asc" ? "desc" : "asc",
                    )
                  }
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  {sortDirection === "asc" ? "Ascending" : "Descending"}
                  {sortDirection === "asc" ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {Object.entries(categoryConfig)
            .filter(
              ([key]) => key === "all" || (categoryCounts[key] || 0) > 0,
            )
            .map(([key, config]) => {
              const isActive = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as EmailCategory)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border hover:scale-105 active:scale-95 ${isActive ? "bg-[var(--aura-accent)] text-[#0a0b18] border-[var(--aura-accent)] shadow-[0_0_14px_-2px_var(--aura-glow)]" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"}`}
                >
                  {config.label}
                </button>
              );
            })}
        </div>
      </div>

      {/* Email Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {emailsLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-t-2 border-l-2 border-[var(--aura-accent-strong)] animate-spin" />
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Inbox className="w-10 h-10 mx-auto mb-4 opacity-20 text-gray-400" />
            <p className="text-sm text-gray-500">
              No emails match your criteria.
            </p>
          </div>
        ) : (
          filteredEmails.map((email) => {
            const isSelected = selectedEmail?.id === email.id;
            const cat =
              categoryConfig[
                email.category?.toLowerCase() || "announcement"
              ] || categoryConfig.announcement;
            return (
              <div key={email.id} className="group/row relative">
                <button
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full text-left p-4 rounded-r-lg transition-all duration-200 border-l-2 border-y-0 border-r-0 ${isSelected ? "bg-[var(--aura-accent-soft)] border-[var(--aura-accent)]" : "bg-transparent border-transparent hover:translate-x-0.5 hover:border-[var(--aura-line-strong)] hover:bg-[var(--aura-surface-hover)]"}`}
                >
                  <div className="flex justify-between items-start mb-1.5 gap-3 pr-6">
                    <span
                      className={`font-semibold text-sm truncate ${isSelected ? "text-[var(--aura-text)]" : "text-gray-200"}`}
                    >
                      {email.company || email.subject}
                    </span>
                    <span
                      className={`mono-num text-[10px] shrink-0 whitespace-nowrap mt-0.5 ${isSelected ? "text-[var(--aura-accent)]" : "text-gray-500"}`}
                    >
                      {formatRelativeDate(email.receivedAt)}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate mb-3 ${isSelected ? "text-gray-300" : "text-gray-500"}`}
                  >
                    {email.role || email.snippet}
                  </p>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {!!email.followupCount && (
                      <div className="flex items-center gap-1 text-[10px] text-cyan-300 font-medium bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        <MessagesSquare className="w-3 h-3" />
                        {email.followupCount}{" "}
                        {email.followupCount === 1 ? "reply" : "replies"}
                      </div>
                    )}
                    {!!email.threadMessages?.some(
                      (message) => message.attachments?.length,
                    ) && (
                      <div
                        className="flex items-center gap-1 text-[10px] text-gray-300 font-medium bg-white/5 px-1.5 py-0.5 rounded"
                        title="Conversation has attachments"
                      >
                        <Paperclip className="w-3 h-3" />
                        {email.threadMessages.reduce(
                          (count, message) =>
                            count + (message.attachments?.length || 0),
                          0,
                        )}
                      </div>
                    )}
                    {email.priority === "high" && (
                      <div className="flex items-center gap-1 text-[10px] text-rose-400 font-medium bg-rose-500/10 px-1.5 py-0.5 rounded">
                        <Zap className="w-3 h-3" /> High
                      </div>
                    )}
                    {email.deadline && (
                      <div
                        className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${formatDeadline(email.deadline).urgent ? "text-amber-400 bg-amber-500/10" : "text-blue-400 bg-blue-500/10"}`}
                      >
                        <Clock className="w-3 h-3" />{" "}
                        {formatDeadline(email.deadline).text}
                      </div>
                    )}
                    {!email.deadline && !email.priority && (
                      <div
                        className={`flex items-center gap-1 text-[10px] font-medium ${cat.colorClass}`}
                      >
                        <cat.icon className="w-3 h-3" /> {cat.label}
                      </div>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => onToggleImportant(email)}
                  aria-label={
                    email.important ? "Unmark as important" : "Mark as important"
                  }
                  aria-pressed={!!email.important}
                  className={`absolute top-3 right-3 z-10 p-1 rounded-md transition-all hover:scale-110 active:scale-95 ${email.important ? "text-amber-400 opacity-100" : "text-gray-500 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 hover:text-amber-300"}`}
                >
                  <Star
                    className="w-3.5 h-3.5"
                    fill={email.important ? "currentColor" : "none"}
                  />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
