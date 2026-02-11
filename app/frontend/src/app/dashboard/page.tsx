"use client"
import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/lib/authContext"
import type { LucideIcon } from "lucide-react"
import {
  Mail,
  LogOut,
  Briefcase,
  Building2,
  GraduationCap,
  Clock,
  ExternalLink,
  X,
  RefreshCw,
  Inbox,
  CalendarPlus,
  ChevronRight,
  Bell,
  MapPin,
  DollarSign,
  FileText,
  User,
  AlertTriangle,
  ChevronLeft,
  Presentation,
  Wrench,
  ClipboardCheck,
  UserCheck,
  Tag,
  Zap,
  Star,
  Calendar,
  Search,
  LayoutDashboard,
  CalendarCheck,
  TrendingUp,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Tokyo Night Storm - Darker variant
const colors = {
  bg: "#0a0a0f",
  bgAlt: "#0f0f17",
  bgCard: "#14141f",
  bgHover: "#1a1a2e",
  bgHighlight: "#1f1f3a",
  border: "#1a1a2e",
  fg: "#c0caf5",
  fgMuted: "#a9b1d6",
  fgDim: "#565f89",
  blue: "#7aa2f7",
  cyan: "#7dcfff",
  magenta: "#bb9af7",
  purple: "#9d7cd8",
  orange: "#ff9e64",
  yellow: "#e0af68",
  green: "#9ece6a",
  teal: "#73daca",
  red: "#f7768e",
  pink: "#ff007c",
}

interface PlacementEmail {
  id: string
  gmailMessageId: string
  subject: string
  sender: string
  snippet: string
  receivedAt: string
  company: string | null
  role: string | null
  deadline: string | null
  applyLink: string | null
  otherLinks?: string[] | null
  attachments?: Array<{ filename: string; mimeType: string; size: number; attachmentId: string }> | null
  eligibility: string | null
  timings: string | null
  salary: string | null
  location: string | null
  eventDetails?: string | null
  requirements?: string | null
  description?: string | null
  category?: string
  tags?: string[]
  priority?: string
  summary?: string
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  location?: string
  link?: string
  isAuraMail: boolean
}

type View = "dashboard" | "inbox"
type EmailCategory = "all" | "internship" | "job offer" | "ppt" | "workshop" | "exam" | "interview" | "result" | "reminder" | "announcement" | "registration"
type SortOption = "date" | "priority" | "company" | "deadline"
type SortDirection = "asc" | "desc"

const sortOptions: { value: SortOption; label: string; icon: LucideIcon }[] = [
  { value: "date", label: "Date Received", icon: Clock },
  { value: "priority", label: "Priority", icon: Zap },
  { value: "company", label: "Company", icon: Building2 },
  { value: "deadline", label: "Deadline", icon: Calendar },
]

const categoryConfig: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  all: { icon: Inbox, label: "All", color: colors.fg },
  internship: { icon: Briefcase, label: "Internships", color: colors.blue },
  "job offer": { icon: Building2, label: "Jobs", color: colors.green },
  ppt: { icon: Presentation, label: "PPT", color: colors.purple },
  workshop: { icon: Wrench, label: "Workshops", color: colors.orange },
  exam: { icon: GraduationCap, label: "Exams", color: colors.yellow },
  interview: { icon: UserCheck, label: "Interviews", color: colors.cyan },
  result: { icon: ClipboardCheck, label: "Results", color: colors.teal },
  reminder: { icon: Clock, label: "Reminders", color: colors.red },
  announcement: { icon: Bell, label: "Announcements", color: colors.magenta },
  registration: { icon: FileText, label: "Registration", color: colors.pink },
}

const tagColors: Record<string, string> = {
  urgent: colors.red,
  "high-package": colors.green,
  "dream-company": colors.yellow,
  "mass-hiring": colors.blue,
  "off-campus": colors.purple,
  "on-campus": colors.cyan,
  remote: colors.teal,
  hybrid: colors.orange,
  "tier-1": colors.yellow,
  startup: colors.pink,
  mnc: colors.blue,
  govt: colors.cyan,
  core: colors.purple,
  it: colors.blue,
  "fresher-friendly": colors.green,
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  
  const [emails, setEmails] = useState<PlacementEmail[]>([])
  const [emailsLoading, setEmailsLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory>("all")
  const [selectedEmail, setSelectedEmail] = useState<PlacementEmail | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calendarEventsMap, setCalendarEventsMap] = useState<Record<string, string>>({})
  const [addingToCalendar, setAddingToCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  
  const syncingRef = useRef(false)

  const fetchEmails = useCallback(async (silent = false) => {
    if (!silent) setEmailsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${API_URL}/emails`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const errorMessage = data?.message || `Failed to fetch emails (${res.status})`
        throw new Error(errorMessage)
      }
      
      const data = await res.json()
      setEmails(data.emails || [])
    } catch (err) {
      if (!silent) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load emails"
        setError(errorMessage)
      }
    } finally {
      if (!silent) setEmailsLoading(false)
    }
  }, [])

  const fetchCalendarEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${API_URL}/calendar/events?days=30`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.success && data.events) {
        setCalendarEvents(data.events)
        const map: Record<string, string> = {}
        data.events.forEach((e: CalendarEvent) => {
          if (e.isAuraMail) map[e.title] = e.id
        })
        setCalendarEventsMap(map)
      }
    } catch {}
  }, [])

  const handleSync = useCallback(async () => {
    if (syncingRef.current) return
    syncingRef.current = true
    setSyncing(true)
    setError(null)
    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${API_URL}/emails/sync`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      // Parse response body regardless of status
      const data = await res.json().catch(() => null)
      
      if (!res.ok) {
        // Handle HTTP errors with response body details
        const errorMessage = data?.message || `Sync failed with status ${res.status}`
        throw new Error(errorMessage)
      }
      
      // Check for application-level errors in successful response
      if (data && !data.success) {
        // Handle specific error codes
        const errorCode = data.error || "UNKNOWN_ERROR"
        let userMessage = data.message || "Sync completed with errors"
        
        switch (errorCode) {
          case "NO_EMAILS_FOUND":
            userMessage = "No emails found matching your query. Try adjusting your search or check your email settings."
            break
          case "GMAIL_API_ERROR":
            userMessage = "Could not connect to Gmail. Please try again or re-authorize your account."
            break
          case "INVALID_REFRESH_TOKEN":
            userMessage = "Your Gmail authorization has expired. Please log out and log in again."
            break
          case "GMAIL_AUTH_FAILED":
            userMessage = "Failed to authenticate with Gmail. Please log out and log in again to re-authorize."
            break
        }
        
        setError(userMessage)
        // Still refresh emails if any were processed
        if (data.processed > 0) {
          await fetchEmails(true)
          await fetchCalendarEvents()
        }
        return
      }
      
      await fetchEmails(true)
      await fetchCalendarEvents()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sync emails. Please try again."
      setError(errorMessage)
    } finally {
      syncingRef.current = false
      setSyncing(false)
    }
  }, [fetchEmails, fetchCalendarEvents])

  useEffect(() => {
    if (!loading && !user) {
      // Use replace to prevent back navigation to dashboard when not authenticated
      router.replace("/")
      return
    }
    if (user) {
      fetchEmails()
      fetchCalendarEvents()
    }
  }, [user, loading, router, fetchEmails, fetchCalendarEvents])

  // Date helpers
  const getDaysDiff = (date: string): number => {
    const target = new Date(date)
    const now = new Date()
    const targetUTC = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate())
    const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    return Math.floor((targetUTC - nowUTC) / (1000 * 60 * 60 * 24))
  }

  const formatRelativeDate = (date: string) => {
    const days = -getDaysDiff(date)
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatDeadline = (date: string) => {
    const days = getDaysDiff(date)
    if (days < 0) return { text: `${Math.abs(days)}d overdue`, urgent: true }
    if (days === 0) return { text: "Today", urgent: true }
    if (days === 1) return { text: "Tomorrow", urgent: true }
    if (days <= 3) return { text: `${days} days`, urgent: true }
    if (days <= 7) return { text: `${days} days`, urgent: false }
    return { text: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), urgent: false }
  }

  // Computed data
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: emails.length }
    emails.forEach(e => {
      const cat = e.category?.toLowerCase() || "announcement"
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [emails])

  const filteredEmails = useMemo(() => {
    const filtered = emails.filter(e => {
      const matchCat = selectedCategory === "all" || e.category?.toLowerCase() === selectedCategory
      const matchSearch = !searchQuery || 
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.role?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })

    // Sort function
    const sortedEmails = [...filtered].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "date":
          comparison = new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
          break
        case "priority":
          // high > medium > low > undefined
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
          const aPriority = priorityOrder[a.priority || ""] || 0
          const bPriority = priorityOrder[b.priority || ""] || 0
          comparison = bPriority - aPriority
          break
        case "company":
          const aCompany = (a.company || a.subject || "").toLowerCase()
          const bCompany = (b.company || b.subject || "").toLowerCase()
          comparison = aCompany.localeCompare(bCompany)
          break
        case "deadline":
          // Emails with deadlines first, then by deadline date
          if (!a.deadline && !b.deadline) comparison = 0
          else if (!a.deadline) comparison = 1
          else if (!b.deadline) comparison = -1
          else comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          break
      }
      
      // Apply sort direction
      return sortDirection === "asc" ? comparison : -comparison
    })

    return sortedEmails
  }, [emails, selectedCategory, searchQuery, sortBy, sortDirection])

  const upcomingDeadlines = useMemo(() => {
    return emails
      .filter(e => e.deadline && getDaysDiff(e.deadline) >= -1)
      .sort((a, b) => getDaysDiff(a.deadline!) - getDaysDiff(b.deadline!))
      .slice(0, 4)
  }, [emails])

  const highPriorityCount = emails.filter(e => e.priority === "high").length
  const overdueCount = emails.filter(e => e.deadline && getDaysDiff(e.deadline) < 0).length

  const upcomingEvents = useMemo(() => {
    return calendarEvents
      .filter(e => {
        const days = getDaysDiff(e.startTime)
        return days >= 0 && days <= 7
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 4)
  }, [calendarEvents])

  // Calendar helpers
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days: { date: number; isCurrentMonth: boolean; isToday: boolean; hasDeadline: boolean; hasEvent: boolean }[] = []
    
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ date: prevMonthLastDay - i, isCurrentMonth: false, isToday: false, hasDeadline: false, hasEvent: false })
    }
    
    const today = new Date()
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: today.getDate() === i && today.getMonth() === month && today.getFullYear() === year,
        hasDeadline: emails.some(e => e.deadline?.startsWith(dateStr)),
        hasEvent: calendarEvents.some(e => e.startTime.startsWith(dateStr)),
      })
    }
    
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: i, isCurrentMonth: false, isToday: false, hasDeadline: false, hasEvent: false })
    }
    
    return days
  }

  const navigateMonth = (dir: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1))
  }

  // Calendar add/remove
  const getEmailTitle = (email: PlacementEmail) => 
    email.company ? `${email.company}${email.role ? ` - ${email.role}` : ""}` : email.subject

  const isInCalendar = (email: PlacementEmail) => {
    const title = getEmailTitle(email)
    return !!calendarEventsMap[title] || !!calendarEventsMap[email.id]
  }

  const addToCalendar = async (email: PlacementEmail) => {
    if (!email.deadline || isInCalendar(email)) return
    setAddingToCalendar(true)
    try {
      const token = localStorage.getItem("accessToken")
      const title = getEmailTitle(email)
      let startTime = email.deadline
      if (!startTime.includes("T")) startTime = `${startTime}T10:00:00`
      
      const res = await fetch(`${API_URL}/calendar/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: email.summary || email.snippet, startTime, location: email.location || "", emailId: email.id, company: email.company || "", role: email.role || "", eventType: "deadline" }),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setCalendarEventsMap(prev => ({ ...prev, [title]: data.eventId, [email.id]: data.eventId }))
      fetchCalendarEvents()
    } catch {
      setError("Failed to add to calendar")
    } finally {
      setAddingToCalendar(false)
    }
  }

  const removeFromCalendar = async (email: PlacementEmail) => {
    const title = getEmailTitle(email)
    const eventId = calendarEventsMap[title] || calendarEventsMap[email.id]
    if (!eventId) return
    setAddingToCalendar(true)
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`${API_URL}/calendar/events?eventId=${eventId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      setCalendarEventsMap(prev => { const next = { ...prev }; delete next[title]; delete next[email.id]; return next })
      fetchCalendarEvents()
    } catch {
      setError("Failed to remove from calendar")
    } finally {
      setAddingToCalendar(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: colors.bgHighlight, borderTopColor: colors.blue }} />
          <span className="text-sm" style={{ color: colors.fgDim }}>Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  const renderTag = (tag: string) => (
    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${tagColors[tag] || colors.fgDim}20`, color: tagColors[tag] || colors.fgDim }}>
      {tag}
    </span>
  )

  // ============ DASHBOARD VIEW ============
  const renderDashboard = () => (
    <div className="flex-1 overflow-auto">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: colors.fg }}>
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user.name?.split(" ")[0]}
          </h1>
          <p className="text-sm" style={{ color: colors.fgDim }}>
            Here&apos;s what&apos;s happening with your placement emails
          </p>
        </div>

        {/* Main Grid - Left content, Right calendar */}
        <div className="flex gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Emails", value: emails.length, icon: Mail, color: colors.blue, trend: "+12%" },
                { label: "Deadlines", value: upcomingDeadlines.length, icon: Clock, color: colors.yellow },
                { label: "High Priority", value: highPriorityCount, icon: Zap, color: colors.red },
                { label: "Overdue", value: overdueCount, icon: AlertTriangle, color: colors.orange },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-2xl border" style={{ background: colors.bgCard, borderColor: colors.border }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                      <s.icon className="w-5 h-5" style={{ color: s.color }} />
                    </div>
                    {s.trend && (
                      <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: `${colors.green}15`, color: colors.green }}>
                        <TrendingUp className="w-3 h-3" />{s.trend}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold mb-0.5" style={{ color: colors.fg }}>{s.value}</p>
                  <p className="text-xs" style={{ color: colors.fgDim }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Two Column Section */}
            <div className="grid grid-cols-2 gap-6">
              {/* Upcoming Deadlines */}
              <div className="rounded-2xl border p-5" style={{ background: colors.bgCard, borderColor: colors.border }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.fg }}>
                    <Clock className="w-4 h-4" style={{ color: colors.yellow }} />
                    Upcoming Deadlines
                  </h2>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: colors.bgHover, color: colors.fgDim }}>
                    {upcomingDeadlines.length} active
                  </span>
                </div>
                {upcomingDeadlines.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: colors.fgDim }} />
                    <p className="text-sm" style={{ color: colors.fgDim }}>No upcoming deadlines</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingDeadlines.map(email => {
                      const dl = formatDeadline(email.deadline!)
                      const days = getDaysDiff(email.deadline!)
                      return (
                        <div
                          key={email.id}
                          onClick={() => { setSelectedEmail(email); setCurrentView("inbox") }}
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                          style={{ background: colors.bgHover }}
                        >
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                            style={{ background: `${dl.urgent ? colors.red : colors.blue}15`, color: dl.urgent ? colors.red : colors.blue }}
                          >
                            {days < 0 ? "!" : `${days}d`}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" style={{ color: colors.fg }}>{email.company || email.subject}</p>
                            <p className="text-xs truncate" style={{ color: colors.fgDim }}>{email.role || dl.text}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 shrink-0 opacity-40" style={{ color: colors.fgDim }} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Recent Emails */}
              <div className="rounded-2xl border p-5" style={{ background: colors.bgCard, borderColor: colors.border }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.fg }}>
                    <Inbox className="w-4 h-4" style={{ color: colors.blue }} />
                    Recent Emails
                  </h2>
                  <button onClick={() => setCurrentView("inbox")} className="text-xs flex items-center gap-1 hover:underline" style={{ color: colors.blue }}>
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {emailsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: colors.bgHighlight, borderTopColor: colors.blue }} />
                  </div>
                ) : emails.length === 0 ? (
                  <div className="text-center py-8">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: colors.fgDim }} />
                    <p className="text-sm mb-3" style={{ color: colors.fgDim }}>No emails yet</p>
                    <button onClick={handleSync} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: colors.blue, color: "#fff" }}>
                      Sync Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {emails.slice(0, 4).map(email => {
                      const cat = categoryConfig[email.category?.toLowerCase() || "announcement"] || categoryConfig.announcement
                      const Icon = cat.icon
                      return (
                        <div
                          key={email.id}
                          onClick={() => { setSelectedEmail(email); setCurrentView("inbox") }}
                          className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cat.color}15` }}>
                            <Icon className="w-4 h-4" style={{ color: cat.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: colors.fg }}>{email.company || email.subject}</p>
                            <p className="text-xs truncate" style={{ color: colors.fgDim }}>{email.role || email.snippet}</p>
                          </div>
                          <span className="text-[10px] shrink-0" style={{ color: colors.fgDim }}>{formatRelativeDate(email.receivedAt)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="rounded-2xl border p-5" style={{ background: colors.bgCard, borderColor: colors.border }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.fg }}>
                <Tag className="w-4 h-4" style={{ color: colors.purple }} />
                Categories
              </h2>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(categoryConfig)
                  .filter(([key]) => key !== "all")
                  .map(([key, config]) => {
                    const count = categoryCounts[key] || 0
                    const Icon = config.icon
                    return (
                      <button
                        key={key}
                        onClick={() => { setSelectedCategory(key as EmailCategory); setCurrentView("inbox") }}
                        className="p-4 rounded-xl text-center transition-all hover:scale-[1.02] border"
                        style={{ background: count > 0 ? `${config.color}08` : colors.bgHover, borderColor: count > 0 ? `${config.color}20` : 'transparent' }}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: count > 0 ? config.color : colors.fgDim }} />
                        <p className="text-lg font-bold" style={{ color: count > 0 ? colors.fg : colors.fgDim }}>{count}</p>
                        <p className="text-[10px]" style={{ color: colors.fgDim }}>{config.label}</p>
                      </button>
                    )
                  })}
              </div>
            </div>
          </div>

          {/* Right Column - Calendar & Events */}
          <div className="w-80 shrink-0 space-y-6">
            {/* Calendar */}
            <div className="rounded-2xl border p-5" style={{ background: colors.bgCard, borderColor: colors.border }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold" style={{ color: colors.fg }}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigateMonth(-1)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10">
                    <ChevronLeft className="w-4 h-4" style={{ color: colors.fgDim }} />
                  </button>
                  <button onClick={() => navigateMonth(1)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10">
                    <ChevronRight className="w-4 h-4" style={{ color: colors.fgDim }} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] py-1 font-medium" style={{ color: colors.fgDim }}>{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, i) => (
                  <div
                    key={i}
                    className="aspect-square flex items-center justify-center text-xs rounded-lg relative"
                    style={{ 
                      background: day.isToday ? colors.blue : 'transparent',
                      color: day.isToday ? "#fff" : !day.isCurrentMonth ? colors.fgDim + '40' : colors.fgMuted
                    }}
                  >
                    {day.date}
                    {(day.hasDeadline || day.hasEvent) && !day.isToday && (
                      <div className="absolute bottom-0.5 flex gap-0.5">
                        {day.hasDeadline && <div className="w-1 h-1 rounded-full" style={{ background: colors.yellow }} />}
                        {day.hasEvent && <div className="w-1 h-1 rounded-full" style={{ background: colors.green }} />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 flex gap-4 text-[10px] border-t" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.yellow }} />
                  <span style={{ color: colors.fgDim }}>Deadlines</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.green }} />
                  <span style={{ color: colors.fgDim }}>Events</span>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="rounded-2xl border p-5" style={{ background: colors.bgCard, borderColor: colors.border }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.fg }}>
                <CalendarCheck className="w-4 h-4" style={{ color: colors.green }} />
                Upcoming Events
              </h2>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: colors.fgDim }} />
                  <p className="text-xs" style={{ color: colors.fgDim }}>No events this week</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => {
                    const eventDate = new Date(event.startTime)
                    const days = getDaysDiff(event.startTime)
                    return (
                      <a
                        key={event.id}
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-white/5"
                        style={{ background: colors.bgHover }}
                      >
                        <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0" style={{ background: `${colors.green}15` }}>
                          <span className="text-[9px] uppercase font-medium" style={{ color: colors.fgDim }}>
                            {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-sm font-bold leading-none" style={{ color: colors.green }}>
                            {eventDate.getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate mb-0.5" style={{ color: colors.fg }}>{event.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: colors.fgDim }}>
                              {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                            {days === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${colors.green}20`, color: colors.green }}>Today</span>}
                            {days === 1 && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${colors.cyan}20`, color: colors.cyan }}>Tomorrow</span>}
                          </div>
                        </div>
                        {event.isAuraMail && <Sparkles className="w-3 h-3 shrink-0 mt-1" style={{ color: colors.magenta }} />}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ============ INBOX VIEW ============
  const renderInbox = () => (
    <div className="flex flex-1 min-h-0">
      {/* Email List */}
      <div className={`${selectedEmail ? "w-[420px]" : "flex-1 max-w-2xl"} flex flex-col border-r`} style={{ borderColor: colors.border }}>
        <div className="p-4 space-y-3 border-b" style={{ borderColor: colors.border }}>
          {/* Search and Sort Row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.fgDim }} />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{ background: colors.bgHover, color: colors.fg, borderColor: colors.border }}
              />
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-colors"
                style={{ 
                  background: showSortDropdown ? colors.bgHighlight : colors.bgHover, 
                  color: colors.fgMuted, 
                  borderColor: showSortDropdown ? colors.blue : colors.border 
                }}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">{sortOptions.find(s => s.value === sortBy)?.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
              </button>
              
              {showSortDropdown && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSortDropdown(false)} 
                  />
                  
                  {/* Dropdown Menu */}
                  <div 
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-xl z-20 overflow-hidden"
                    style={{ background: colors.bgCard, borderColor: colors.border }}
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-medium" style={{ color: colors.fgDim }}>
                        Sort by
                      </div>
                      {sortOptions.map(option => {
                        const Icon = option.icon
                        const isActive = sortBy === option.value
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              if (sortBy === option.value) {
                                // Toggle direction if same option clicked
                                setSortDirection(prev => prev === "asc" ? "desc" : "asc")
                              } else {
                                setSortBy(option.value)
                                // Set sensible default direction for each sort type
                                setSortDirection(option.value === "company" ? "asc" : "desc")
                              }
                              setShowSortDropdown(false)
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                            style={{ 
                              background: isActive ? colors.bgHighlight : "transparent",
                              color: isActive ? colors.fg : colors.fgMuted 
                            }}
                          >
                            <Icon className="w-4 h-4" style={{ color: isActive ? colors.blue : colors.fgDim }} />
                            <span className="flex-1 text-left">{option.label}</span>
                            {isActive && (
                              sortDirection === "desc" 
                                ? <ArrowDown className="w-3.5 h-3.5" style={{ color: colors.blue }} />
                                : <ArrowUp className="w-3.5 h-3.5" style={{ color: colors.blue }} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                    
                    <div className="border-t px-2 py-2" style={{ borderColor: colors.border }}>
                      <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-medium" style={{ color: colors.fgDim }}>
                        Direction
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setSortDirection("desc"); setShowSortDropdown(false) }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                          style={{ 
                            background: sortDirection === "desc" ? colors.blue : colors.bgHover,
                            color: sortDirection === "desc" ? "#fff" : colors.fgMuted 
                          }}
                        >
                          <ArrowDown className="w-3 h-3" /> Descending
                        </button>
                        <button
                          onClick={() => { setSortDirection("asc"); setShowSortDropdown(false) }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                          style={{ 
                            background: sortDirection === "asc" ? colors.blue : colors.bgHover,
                            color: sortDirection === "asc" ? "#fff" : colors.fgMuted 
                          }}
                        >
                          <ArrowUp className="w-3 h-3" /> Ascending
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {Object.entries(categoryConfig)
              .filter(([key]) => key === "all" || (categoryCounts[key] || 0) > 0)
              .map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as EmailCategory)}
                  className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors font-medium"
                  style={{
                    background: selectedCategory === key ? colors.blue : colors.bgHover,
                    color: selectedCategory === key ? "#fff" : colors.fgMuted,
                  }}
                >
                  {config.label}
                </button>
              ))}
          </div>
          
          {/* Active Sort Indicator */}
          {(sortBy !== "date" || sortDirection !== "desc") && (
            <div className="flex items-center gap-2 text-xs" style={{ color: colors.fgDim }}>
              <span>Sorted by:</span>
              <span className="px-2 py-0.5 rounded-full flex items-center gap-1.5" style={{ background: colors.bgHighlight, color: colors.blue }}>
                {(() => {
                  const opt = sortOptions.find(s => s.value === sortBy)
                  const Icon = opt?.icon || Clock
                  return (
                    <>
                      <Icon className="w-3 h-3" />
                      {opt?.label}
                      {sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    </>
                  )
                })()}
              </span>
              <button 
                onClick={() => { setSortBy("date"); setSortDirection("desc") }}
                className="hover:underline"
                style={{ color: colors.fgDim }}
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {emailsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: colors.bgHighlight, borderTopColor: colors.blue }} />
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: colors.fgDim }} />
              <p style={{ color: colors.fgDim }}>No emails found</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredEmails.map(email => {
                const cat = categoryConfig[email.category?.toLowerCase() || "announcement"] || categoryConfig.announcement
                const Icon = cat.icon
                const isSelected = selectedEmail?.id === email.id
                return (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className="w-full text-left p-4 rounded-xl mb-1 transition-all"
                    style={{ background: isSelected ? colors.bgHighlight : "transparent" }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color}15` }}>
                        <Icon className="w-5 h-5" style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-medium truncate" style={{ color: colors.fg }}>{email.company || email.subject}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {email.priority === "high" && <Star className="w-3.5 h-3.5" style={{ color: colors.yellow, fill: colors.yellow }} />}
                            <span className="text-[10px]" style={{ color: colors.fgDim }}>{formatRelativeDate(email.receivedAt)}</span>
                          </div>
                        </div>
                        {email.role && <p className="text-sm mb-1 truncate" style={{ color: colors.fgMuted }}>{email.role}</p>}
                        <p className="text-xs truncate mb-2" style={{ color: colors.fgDim }}>{email.summary || email.snippet}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {email.deadline && (() => {
                            const dl = formatDeadline(email.deadline)
                            return (
                              <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium" style={{ background: `${dl.urgent ? colors.red : colors.blue}15`, color: dl.urgent ? colors.red : colors.blue }}>
                                <Clock className="w-2.5 h-2.5" /> {dl.text}
                              </span>
                            )
                          })()}
                          {email.tags?.slice(0, 2).map(renderTag)}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Email Detail */}
      {selectedEmail && (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: colors.bgAlt }}>
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b shrink-0" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold truncate" style={{ color: colors.fg }}>{selectedEmail.company || "Email Details"}</span>
              {selectedEmail.role && (
                <>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: colors.fgDim }} />
                  <span className="truncate" style={{ color: colors.fgMuted }}>{selectedEmail.role}</span>
                </>
              )}
            </div>
            <button onClick={() => setSelectedEmail(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5">
              <X className="w-4 h-4" style={{ color: colors.fgDim }} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              
              {/* Hero Section */}
              <div className="rounded-2xl p-6 border" style={{ background: colors.bgCard, borderColor: colors.border }}>
                {/* Category & Priority Badges */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {selectedEmail.category && (() => {
                    const cat = categoryConfig[selectedEmail.category.toLowerCase()] || categoryConfig.announcement
                    const Icon = cat.icon
                    return (
                      <span className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium" style={{ background: `${cat.color}15`, color: cat.color }}>
                        <Icon className="w-3.5 h-3.5" /> {cat.label}
                      </span>
                    )
                  })()}
                  {selectedEmail.priority === "high" && (
                    <span className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium" style={{ background: `${colors.red}15`, color: colors.red }}>
                      <Zap className="w-3.5 h-3.5" /> High Priority
                    </span>
                  )}
                  {selectedEmail.priority === "medium" && (
                    <span className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium" style={{ background: `${colors.yellow}15`, color: colors.yellow }}>
                      <Star className="w-3.5 h-3.5" /> Medium Priority
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold mb-2 leading-tight" style={{ color: colors.fg }}>
                  {selectedEmail.company || selectedEmail.subject}
                </h1>
                {selectedEmail.role && selectedEmail.company && (
                  <p className="text-lg mb-3" style={{ color: colors.fgMuted }}>{selectedEmail.role}</p>
                )}
                
                {/* Meta info */}
                <div className="flex items-center gap-4 text-sm" style={{ color: colors.fgDim }}>
                  <span>{new Date(selectedEmail.receivedAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                </div>

                {/* Tags */}
                {selectedEmail.tags && selectedEmail.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                    {selectedEmail.tags.map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${tagColors[tag] || colors.fgDim}15`, color: tagColors[tag] || colors.fgDim }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                {selectedEmail.applyLink && (
                  <a href={selectedEmail.applyLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: colors.green, color: "#fff" }}>
                    <ExternalLink className="w-4 h-4" /> Apply Now
                  </a>
                )}
                {selectedEmail.deadline && (
                  isInCalendar(selectedEmail) ? (
                    <button onClick={() => removeFromCalendar(selectedEmail)} disabled={addingToCalendar} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all hover:scale-105 border" style={{ background: `${colors.green}15`, color: colors.green, borderColor: `${colors.green}30` }}>
                      <CalendarCheck className="w-4 h-4" /> Added to Calendar
                    </button>
                  ) : (
                    <button onClick={() => addToCalendar(selectedEmail)} disabled={addingToCalendar} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all hover:scale-105" style={{ background: colors.blue, color: "#fff" }}>
                      <CalendarPlus className="w-4 h-4" /> Add to Calendar
                    </button>
                  )
                )}
                {selectedEmail.otherLinks && selectedEmail.otherLinks.length > 0 && (
                  <a href={selectedEmail.otherLinks[0]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors border" style={{ background: colors.bgHover, color: colors.fg, borderColor: colors.border }}>
                    <ExternalLink className="w-4 h-4" /> View Link
                  </a>
                )}
              </div>

              {/* Key Details Grid */}
              {(selectedEmail.deadline || selectedEmail.location || selectedEmail.salary || selectedEmail.eligibility || selectedEmail.timings) && (
                <div className="rounded-2xl border overflow-hidden" style={{ background: colors.bgCard, borderColor: colors.border }}>
                  <div className="px-5 py-3 border-b" style={{ borderColor: colors.border }}>
                    <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: colors.fg }}>
                      <FileText className="w-4 h-4" style={{ color: colors.cyan }} /> Key Details
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: colors.border }}>
                    {selectedEmail.deadline && (
                      <div className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${colors.yellow}15` }}>
                          <Clock className="w-5 h-5" style={{ color: colors.yellow }} />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.fgDim }}>Deadline</p>
                          <p className="text-sm font-semibold" style={{ color: formatDeadline(selectedEmail.deadline).urgent ? colors.red : colors.fg }}>
                            {new Date(selectedEmail.deadline).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: formatDeadline(selectedEmail.deadline).urgent ? colors.red : colors.fgDim }}>
                            {formatDeadline(selectedEmail.deadline).text}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedEmail.location && (
                      <div className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${colors.blue}15` }}>
                          <MapPin className="w-5 h-5" style={{ color: colors.blue }} />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.fgDim }}>Location</p>
                          <p className="text-sm font-semibold" style={{ color: colors.fg }}>{typeof selectedEmail.location === 'string' ? selectedEmail.location : JSON.stringify(selectedEmail.location)}</p>
                        </div>
                      </div>
                    )}
                    {selectedEmail.salary && (
                      <div className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${colors.green}15` }}>
                          <DollarSign className="w-5 h-5" style={{ color: colors.green }} />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.fgDim }}>Compensation</p>
                          <p className="text-sm font-semibold" style={{ color: colors.fg }}>{typeof selectedEmail.salary === 'string' ? selectedEmail.salary : JSON.stringify(selectedEmail.salary)}</p>
                        </div>
                      </div>
                    )}
                    {selectedEmail.timings && (
                      <div className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${colors.purple}15` }}>
                          <Clock className="w-5 h-5" style={{ color: colors.purple }} />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.fgDim }}>Timings</p>
                          <p className="text-sm" style={{ color: colors.fg }}>{typeof selectedEmail.timings === 'string' ? selectedEmail.timings : JSON.stringify(selectedEmail.timings)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedEmail.eligibility && (
                    <div className="p-4 border-t" style={{ borderColor: colors.border }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${colors.cyan}15` }}>
                          <User className="w-5 h-5" style={{ color: colors.cyan }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.fgDim }}>Eligibility Criteria</p>
                          <div className="text-sm leading-relaxed" style={{ color: colors.fg }}>
                            {typeof selectedEmail.eligibility === 'string' 
                              ? selectedEmail.eligibility.split('\n').map((line, i) => (
                                  <p key={i} className={line.startsWith('•') ? 'pl-2' : ''}>{line}</p>
                                ))
                              : JSON.stringify(selectedEmail.eligibility)
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Summary */}
              {selectedEmail.summary && (
                <div className="rounded-2xl border overflow-hidden" style={{ background: `linear-gradient(135deg, ${colors.magenta}08, ${colors.blue}08)`, borderColor: `${colors.magenta}20` }}>
                  <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: `${colors.magenta}20` }}>
                    <Sparkles className="w-4 h-4" style={{ color: colors.magenta }} />
                    <h2 className="text-sm font-semibold" style={{ color: colors.fg }}>AI Summary</h2>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed" style={{ color: colors.fgMuted }}>{selectedEmail.summary}</p>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {selectedEmail.requirements && (
                <div className="rounded-2xl border overflow-hidden" style={{ background: colors.bgCard, borderColor: colors.border }}>
                  <div className="px-5 py-3 border-b" style={{ borderColor: colors.border }}>
                    <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: colors.fg }}>
                      <ClipboardCheck className="w-4 h-4" style={{ color: colors.orange }} /> Requirements
                    </h2>
                  </div>
                  <div className="p-5">
                    <div className="text-sm leading-relaxed" style={{ color: colors.fgMuted }}>
                      {typeof selectedEmail.requirements === 'string' 
                        ? selectedEmail.requirements.split('\n').map((line, i) => (
                            <p key={i} className={`${line.startsWith('•') ? 'pl-2 flex items-start gap-2' : ''} ${i > 0 ? 'mt-1.5' : ''}`}>
                              {line.startsWith('•') && <span style={{ color: colors.orange }}>•</span>}
                              {line.startsWith('•') ? line.substring(1).trim() : line}
                            </p>
                          ))
                        : JSON.stringify(selectedEmail.requirements)
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* Event Details */}
              {selectedEmail.eventDetails && (
                <div className="rounded-2xl border overflow-hidden" style={{ background: colors.bgCard, borderColor: colors.border }}>
                  <div className="px-5 py-3 border-b" style={{ borderColor: colors.border }}>
                    <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: colors.fg }}>
                      <Calendar className="w-4 h-4" style={{ color: colors.teal }} /> Event Details
                    </h2>
                  </div>
                  <div className="p-5">
                    <div className="text-sm leading-relaxed" style={{ color: colors.fgMuted }}>
                      {typeof selectedEmail.eventDetails === 'string' 
                        ? selectedEmail.eventDetails.split('\n').map((line, i) => (
                            <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
                          ))
                        : JSON.stringify(selectedEmail.eventDetails)
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedEmail.description && (
                <div className="rounded-2xl border overflow-hidden" style={{ background: colors.bgCard, borderColor: colors.border }}>
                  <div className="px-5 py-3 border-b" style={{ borderColor: colors.border }}>
                    <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: colors.fg }}>
                      <FileText className="w-4 h-4" style={{ color: colors.blue }} /> Description
                    </h2>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: colors.fgMuted }}>{selectedEmail.description}</p>
                  </div>
                </div>
              )}

              {/* Other Links */}
              {selectedEmail.otherLinks && selectedEmail.otherLinks.length > 0 && (
                <div className="rounded-2xl border overflow-hidden" style={{ background: colors.bgCard, borderColor: colors.border }}>
                  <div className="px-5 py-3 border-b" style={{ borderColor: colors.border }}>
                    <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: colors.fg }}>
                      <ExternalLink className="w-4 h-4" style={{ color: colors.cyan }} /> Related Links
                    </h2>
                  </div>
                  <div className="p-4 space-y-2">
                    {selectedEmail.otherLinks.map((link, i) => (
                      <a 
                        key={i} 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:scale-[1.01]"
                        style={{ background: colors.bgHover }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${colors.cyan}15` }}>
                          <ExternalLink className="w-4 h-4" style={{ color: colors.cyan }} />
                        </div>
                        <span className="text-sm truncate flex-1" style={{ color: colors.blue }}>{link}</span>
                        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: colors.fgDim }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Original Subject (if different from company) */}
              {selectedEmail.company && selectedEmail.subject && selectedEmail.subject !== selectedEmail.company && (
                <div className="rounded-xl p-4 border" style={{ background: colors.bgHover, borderColor: colors.border }}>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.fgDim }}>Original Subject</p>
                  <p className="text-sm" style={{ color: colors.fgMuted }}>{selectedEmail.subject}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.bg }}>
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 shrink-0" style={{ borderColor: colors.border, background: colors.bgAlt }}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${colors.blue}20` }}>
              <Mail className="w-4 h-4" style={{ color: colors.blue }} />
            </div>
            <span className="text-lg font-bold" style={{ color: colors.fg }}>AuraMail</span>
          </div>
          <nav className="flex items-center gap-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "inbox", label: "Inbox", icon: Inbox },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  background: currentView === item.id ? colors.bgHighlight : "transparent", 
                  color: currentView === item.id ? colors.fg : colors.fgDim 
                }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border" style={{ background: colors.bgHover, color: colors.fg, borderColor: colors.border }}>
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync"}
          </button>
          <div className="w-px h-8" style={{ background: colors.border }} />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: colors.bgHighlight, color: colors.fg }}>
              {user.name?.charAt(0) || "U"}
            </div>
            <span className="text-sm font-medium" style={{ color: colors.fgMuted }}>{user.name?.split(" ")[0]}</span>
          </div>
          <button onClick={() => { logout(); router.push("/") }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5">
            <LogOut className="w-4 h-4" style={{ color: colors.fgDim }} />
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-4 p-3 rounded-xl flex items-center gap-3" style={{ background: `${colors.red}15`, borderColor: `${colors.red}30` }}>
          <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: colors.red }} />
          <span className="text-sm flex-1" style={{ color: colors.red }}>{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4" style={{ color: colors.red }} /></button>
        </div>
      )}

      {/* Content */}
      {currentView === "dashboard" ? renderDashboard() : renderInbox()}
    </div>
  )
}
