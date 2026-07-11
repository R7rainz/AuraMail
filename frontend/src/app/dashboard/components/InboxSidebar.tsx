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
} from "lucide-react";
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
  emailsLoading,
  filteredEmails,
  selectedEmail,
  setSelectedEmail,
}: InboxSidebarProps) {
  return (
    <div className="w-[380px] flex flex-col border-r border-white/10 bg-[#050505] shrink-0 z-10">
      {/* Search & Filters */}
      <div className="p-5 space-y-4 border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-600 outline-none transition-all focus:border-blue-500/50 focus:bg-white/[0.07]"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`h-full px-3 rounded-xl border transition-all flex items-center justify-center ${showSortDropdown ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300"}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[#121212] shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sortBy === opt.value ? "bg-blue-500/10 text-blue-400" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
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
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border ${isActive ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"}`}
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
            <div className="w-6 h-6 rounded-full border-t-2 border-l-2 border-blue-500 animate-spin" />
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
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${isSelected ? "bg-white/10 border-white/20 shadow-lg" : "bg-transparent border-transparent hover:bg-white/[0.04]"}`}
              >
                <div className="flex justify-between items-start mb-1.5 gap-3">
                  <span
                    className={`font-semibold text-sm truncate ${isSelected ? "text-white" : "text-gray-200"}`}
                  >
                    {email.company || email.subject}
                  </span>
                  <span
                    className={`text-[10px] shrink-0 whitespace-nowrap mt-0.5 ${isSelected ? "text-blue-300" : "text-gray-500"}`}
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
            );
          })
        )}
      </div>
    </div>
  );
}
