import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { Inbox, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryConfig, type EmailCategory } from "../types";

interface DashboardNavigationProps {
  selectedCategory: EmailCategory;
  setSelectedCategory: Dispatch<SetStateAction<EmailCategory>>;
  showImportantOnly: boolean;
  setShowImportantOnly: Dispatch<SetStateAction<boolean>>;
  categoryCounts: Record<string, number>;
  importantCount: number;
  onNavigate: () => void;
}

export function DashboardNavigation({
  selectedCategory,
  setSelectedCategory,
  showImportantOnly,
  setShowImportantOnly,
  categoryCounts,
  importantCount,
  onNavigate,
}: DashboardNavigationProps) {
  const selectCategory = (category: EmailCategory) => {
    setShowImportantOnly(false);
    setSelectedCategory(category);
    onNavigate();
  };

  const itemClass =
    "relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200 [&>:not(.nav-active)]:relative";
  const active = (on: boolean) =>
    on ? "font-medium text-foreground" : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground";
  // One highlight slides between items instead of each item lighting up on its own.
  const highlight = (
    <motion.span
      layoutId="nav-active"
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className="nav-active absolute inset-0 rounded-xl bg-accent"
    />
  );

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-card xl:flex">
      <nav className="scrollbar-thin flex-1 overflow-y-auto p-3" aria-label="Mailbox navigation">
        <p className="px-3 pb-2 pt-1 text-xs font-medium text-muted-foreground">Mailbox</p>
        <button
          onClick={() => selectCategory("all")}
          aria-current={!showImportantOnly && selectedCategory === "all" ? "page" : undefined}
          className={cn(itemClass, active(!showImportantOnly && selectedCategory === "all"))}
        >
          {!showImportantOnly && selectedCategory === "all" && highlight}
          <Inbox className="size-4" />
          <span className="flex-1">All messages</span>
          <span className="text-xs tabular-nums">{categoryCounts.all || 0}</span>
        </button>
        <button
          onClick={() => {
            setShowImportantOnly(true);
            setSelectedCategory("all");
            onNavigate();
          }}
          aria-current={showImportantOnly ? "page" : undefined}
          className={cn(itemClass, active(showImportantOnly))}
        >
          {showImportantOnly && highlight}
          <Star className="size-4" />
          <span className="flex-1">Important</span>
          <span className="text-xs tabular-nums">{importantCount}</span>
        </button>

        <p className="px-3 pb-2 pt-6 text-xs font-medium text-muted-foreground">Categories</p>
        {Object.entries(categoryConfig)
          .filter(([key]) => key !== "all" && (categoryCounts[key] || 0) > 0)
          .map(([key, config]) => {
            const Icon = config.icon;
            const isActive = !showImportantOnly && selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => selectCategory(key as EmailCategory)}
                aria-current={isActive ? "page" : undefined}
                className={cn(itemClass, active(isActive))}
              >
                {isActive && highlight}
                <Icon className="size-4" />
                <span className="flex-1 truncate">{config.label}</span>
                <span className="text-xs tabular-nums">{categoryCounts[key]}</span>
              </button>
            );
          })}
      </nav>

      <div className="space-y-2 border-t p-4 text-xs text-muted-foreground">
        <Link href="/#how-it-works" className="block hover:text-foreground">How it works</Link>
        <Link href="/privacy" className="block hover:text-foreground">Privacy</Link>
      </div>
    </aside>
  );
}
