import { useMemo, useState } from "react";
import type { EmailCategory, PlacementEmail, SortDirection, SortOption } from "../types";
import { groupEmailThreads } from "../lib/emailThreads";

export function useEmailFilters(emails: PlacementEmail[]) {
  const conversations = useMemo(() => groupEmailThreads(emails), [emails]);
  const [selectedCategory, setSelectedCategory] =
    useState<EmailCategory>("all");
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  // Default to ascending so the newest emails appear at the top
  // (the date comparator uses b - a, so "asc" = newest first).
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: conversations.length };
    conversations.forEach((e) => {
      const cat = e.category?.toLowerCase() || "announcement";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [conversations]);

  const importantCount = useMemo(
    () => conversations.filter((e) => e.important).length,
    [conversations],
  );

  const filteredEmails = useMemo(() => {
    const filtered = conversations.filter((e) => {
      const matchCat =
        selectedCategory === "all" ||
        e.category?.toLowerCase() === selectedCategory;
      const matchImportant = !showImportantOnly || !!e.important;
      const matchSearch =
        !searchQuery ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.threadMessages?.some(
          (message) =>
            message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.snippet.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      return matchCat && matchImportant && matchSearch;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison =
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
          break;
        case "priority":
          comparison =
            ({ high: 3, medium: 2, low: 1 }[b.priority || ""] || 0) -
            ({ high: 3, medium: 2, low: 1 }[a.priority || ""] || 0);
          break;
        case "company":
          comparison = (a.company || a.subject || "").localeCompare(
            b.company || b.subject || "",
          );
          break;
        case "deadline":
          if (!a.deadline && !b.deadline) comparison = 0;
          else if (!a.deadline) comparison = 1;
          else if (!b.deadline) comparison = -1;
          else
            comparison =
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    conversations,
    selectedCategory,
    showImportantOnly,
    searchQuery,
    sortBy,
    sortDirection,
  ]);

  return {
    selectedCategory,
    setSelectedCategory,
    showImportantOnly,
    setShowImportantOnly,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    categoryCounts,
    importantCount,
    filteredEmails,
  };
}
