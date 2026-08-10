import type { Dispatch, SetStateAction } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Inbox,
  MessagesSquare,
  Paperclip,
  Search,
  Star,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  categoryConfig,
  sortOptions,
  type EmailCategory,
  type PlacementEmail,
  type SortDirection,
  type SortOption,
} from "../types";
import { formatRelativeDate } from "../lib/dateUtils";
import { getRunway, runwayTextClass } from "../lib/runway";
import { RunwayBar } from "./Runway";

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
  className,
}: InboxSidebarProps & { className?: string }) {
  return (
    <aside
      className={cn(
        "glass-panel flex w-full shrink-0 flex-col border-r border-white/10 bg-[#121819]/75 md:w-[380px] xl:w-[420px]",
        className,
      )}
    >
      <div className="space-y-4 border-b border-white/10 px-5 py-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Your inbox
            </p>
            <p className="mt-1 text-lg">Placement opportunities</p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {filteredEmails.length} shown
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search company, role, tag"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu
            open={showSortDropdown}
            onOpenChange={setShowSortDropdown}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Sort inbox">
                <ArrowUpDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              {sortOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => setSortBy(opt.value)}
                >
                  <opt.icon />
                  {opt.label}
                  {sortBy === opt.value && <Check className="ml-auto" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() =>
                  setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                {sortDirection === "asc" ? <ArrowUp /> : <ArrowDown />}
                {sortDirection === "asc" ? "Ascending" : "Descending"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {/* Important is a cross-cutting flag, not a category, so it sits
              ahead of the category pills and toggles independently. */}
          <button
            onClick={() => setShowImportantOnly((prev) => !prev)}
            aria-pressed={showImportantOnly}
            className={cn(
              "flex items-center gap-1 rounded-full border border-white/10 px-3 py-2 text-xs whitespace-nowrap transition-colors outline-none",
              "focus-visible:ring-[3px] focus-visible:ring-ring/50",
              showImportantOnly
                ? "border-primary/30 bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Star
              className={cn("size-3", showImportantOnly && "fill-current")}
            />
            Important
            {importantCount > 0 && (
              <span className="font-mono tabular-nums">{importantCount}</span>
            )}
          </button>

          {Object.entries(categoryConfig)
            .filter(([key]) => key === "all" || (categoryCounts[key] || 0) > 0)
            .map(([key, config]) => {
              const isActive = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as EmailCategory)}
                  aria-pressed={isActive}
                  className={cn(
                    "rounded-full border border-white/10 px-3 py-2 text-xs whitespace-nowrap transition-colors outline-none",
                    "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    isActive
                      ? "border-primary/30 bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {config.label}
                </button>
              );
            })}
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {emailsLoading ? (
          <div className="space-y-1 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2 p-3">
                <div className="flex justify-between gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-1 w-full" />
              </div>
            ))}
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center px-8 py-16 text-center">
            <Inbox className="size-8 text-muted-foreground/40" />
            <p className="mt-4 text-sm font-medium">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              {showImportantOnly
                ? "Nothing is marked important yet. Star a conversation to keep it here."
                : searchQuery || selectedCategory !== "all"
                  ? "Clear the search or pick another category."
                  : "Run a sync to pull placement mail from your inbox."}
            </p>
          </div>
        ) : (
          <ul>
            {filteredEmails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              const cat =
                categoryConfig[email.category?.toLowerCase() || "announcement"] ||
                categoryConfig.announcement;
              const runway = email.deadline
                ? getRunway(email.deadline, email.receivedAt)
                : null;
              const attachmentCount =
                email.threadMessages?.reduce(
                  (count, message) => count + (message.attachments?.length || 0),
                  0,
                ) ?? 0;

              return (
                <li key={email.id} className="group relative">
                  {/* Sibling rather than child: the row is itself a button, and
                      nesting interactive elements is invalid. */}
                  <button
                    onClick={() => onToggleImportant(email)}
                    aria-pressed={!!email.important}
                    aria-label={
                      email.important
                        ? `Unmark ${email.company || email.subject} as important`
                        : `Mark ${email.company || email.subject} as important`
                    }
                    className={cn(
                      "absolute right-4 bottom-4 z-10 p-1.5 transition-all outline-none",
                      "hover:bg-background/80 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      // Stays visible once flagged; otherwise reveals on hover.
                      email.important
                        ? "text-soon opacity-100"
                        : "text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
                    )}
                  >
                    <Star
                      className={cn("size-3.5", email.important && "fill-current")}
                    />
                  </button>

                  <button
                    onClick={() => setSelectedEmail(email)}
                    aria-current={isSelected ? "true" : undefined}
                    className={cn(
                      "w-full border-b border-white/[0.06] px-5 py-4 text-left transition-colors outline-none",
                      "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      isSelected
                        ? "bg-accent/80 text-foreground"
                        : "hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[15px] text-foreground">
                        {email.company || email.subject}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                        {formatRelativeDate(email.receivedAt)}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {email.role || email.snippet || email.sender}
                    </p>

                    {runway && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <RunwayBar runway={runway} className="h-1 flex-1" />
                        <span
                          className={cn(
                            "shrink-0 font-mono text-[11px] tabular-nums",
                            runwayTextClass[runway.status],
                          )}
                        >
                          {runway.label}
                        </span>
                      </div>
                    )}

                    {/* pr-8 reserves the corner the star button occupies. */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pr-8">
                      {email.priority === "high" && (
                        <Badge variant="urgent">
                          <Zap />
                          High
                        </Badge>
                      )}
                      {!!email.followupCount && (
                        <Badge variant="secondary">
                          <MessagesSquare />
                          {email.followupCount}
                        </Badge>
                      )}
                      {attachmentCount > 0 && (
                        <Badge variant="secondary">
                          <Paperclip />
                          {attachmentCount}
                        </Badge>
                      )}
                      {!runway && email.priority !== "high" && (
                        <Badge variant="outline">
                          <cat.icon />
                          {cat.label}
                        </Badge>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
