"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Inbox,
  LockKeyhole,
  Menu,
  Paperclip,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useAuth } from "@/app/lib/authContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const previewEmails = [
  { company: "Microsoft", role: "Software Engineer Intern", due: "Today", active: true },
  { company: "Deutsche Bank", role: "Technology Analyst", due: "2 days", active: false },
  { company: "Sprinklr", role: "Product Engineer", due: "12 days", active: false },
];

const workflow = [
  ["1", "Connect Gmail", "Sign in with the account that receives your placement mail."],
  ["2", "Review your inbox", "AuraMail groups threads and extracts the company, role, deadline, and files."],
  ["3", "Take action", "Open the application, download attachments, or add a deadline to Calendar."],
];

const features = [
  { icon: Inbox, title: "One clear queue", body: "Threads are grouped and sorted so the next deadline is easy to find." },
  { icon: FileText, title: "Details in context", body: "Roles, eligibility, links, and attachments stay beside the original message." },
  { icon: CalendarDays, title: "Deadlines that travel", body: "Add an application deadline to Google Calendar directly from the email." },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, router, user]);

  if (loading || user) return <div className="min-h-dvh bg-background" />;

  const login = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="app-header fixed inset-x-0 top-0 z-50 border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="AuraMail home">
            <span className="brand-mark grid size-8 place-items-center rounded-lg text-sm font-bold">A</span>
            <span className="text-sm font-semibold tracking-tight">AuraMail</span>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
            <a href="#product" className="hover:text-foreground">Product</a>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
                  <Menu />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild><a href="#product">Product</a></DropdownMenuItem>
                <DropdownMenuItem asChild><a href="#how-it-works">How it works</a></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/privacy">Privacy</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/terms">Terms</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={login} className="ml-1">
              Sign in
              <ArrowRight className="hidden sm:block" />
            </Button>
          </div>
        </div>
      </header>

      <main id="top" className="pt-16">
        <section className="border-b">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:py-32">
            <div className="max-w-xl">
              <p className="text-sm font-medium text-primary">Placement inbox for students</p>
              <h1 className="display mt-5 text-5xl text-balance sm:text-6xl">
                Every placement email, organized around what matters.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
                Keep opportunities, deadlines, application links, and attachments in one focused workspace without changing how you receive email.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" onClick={login}>
                  Continue with Google
                  <ArrowRight />
                </Button>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LockKeyhole className="size-4" />
                  Read-only Gmail access
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-xl shadow-black/5">
              <div className="flex h-12 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2">
                  <span className="brand-mark grid size-6 place-items-center rounded-md text-[10px] font-bold">A</span>
                  <span className="text-xs font-semibold">Inbox</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Search className="size-4" />
                  <span className="text-xs">Search</span>
                </div>
              </div>
              <div className="grid min-h-[390px] sm:grid-cols-[245px_1fr]">
                <div className="hidden border-r sm:block">
                  <div className="border-b px-4 py-3 text-xs font-medium text-muted-foreground">Priority first</div>
                  {previewEmails.map((email) => (
                    <div key={email.company} className={`border-b px-4 py-4 ${email.active ? "bg-accent" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{email.company}</p>
                        <span className={email.due === "Today" ? "text-xs text-urgent" : "text-xs text-muted-foreground"}>{email.due}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{email.role}</p>
                    </div>
                  ))}
                </div>
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-primary">Internship</p>
                      <h2 className="mt-2 text-xl font-semibold tracking-tight">Software Engineer Intern</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Microsoft · Placement Office</p>
                    </div>
                    <Star className="size-4 text-muted-foreground" />
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border">
                    <div className="bg-card p-3">
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="mt-1 text-sm font-medium">Today, 11:59 PM</p>
                    </div>
                    <div className="bg-card p-3">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="mt-1 text-sm font-medium">Bengaluru</p>
                    </div>
                  </div>
                  <div className="mt-6 border-t pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Applications are open for the summer engineering internship. Eligible students should submit the form before tonight.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Paperclip className="size-3.5" /> Job description.pdf</span>
                    <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" /> Added to calendar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="border-b bg-card">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-primary">Built for placement mail</p>
              <h2 className="display mt-3 text-3xl sm:text-4xl">A usable inbox, not another tracker to maintain.</h2>
            </div>
            <div className="mt-12 grid border-t md:grid-cols-3">
              {features.map(({ icon: Icon, title, body }, index) => (
                <div key={title} className={`py-8 md:px-8 ${index > 0 ? "border-t md:border-t-0 md:border-l" : ""} md:first:pl-0 md:last:pr-0`}>
                  <Icon className="size-5 text-primary" />
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-b">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="text-sm font-medium text-primary">How it works</p>
                <h2 className="display mt-3 text-3xl sm:text-4xl">Ready in a few minutes.</h2>
              </div>
              <ol className="divide-y border-y">
                {workflow.map(([number, title, body]) => (
                  <li key={number} className="grid gap-3 py-6 sm:grid-cols-[40px_180px_1fr] sm:items-start">
                    <span className="font-mono text-xs text-muted-foreground">{number.padStart(2, "0")}</span>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-card">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center">
            <div>
              <ShieldCheck className="size-6 text-primary" />
              <h2 className="display mt-5 text-3xl sm:text-4xl">Your mailbox stays yours.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                AuraMail uses read-only Gmail access. It does not send, edit, or delete messages, and you can revoke access from your Google account.
              </p>
              <Link href="/privacy" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                Read the privacy policy <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="space-y-4 border-l pl-6 text-sm text-muted-foreground sm:pl-10">
              {["Read-only mailbox permission", "Original messages remain in Gmail", "Clear links back to source content"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-open" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Start with the inbox you already use.</h2>
              <p className="mt-2 text-sm text-muted-foreground">No import and no manual setup.</p>
            </div>
            <Button size="lg" onClick={login}>Continue with Google <ArrowRight /></Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="brand-mark grid size-7 place-items-center rounded-md text-[11px] font-bold">A</span>
            <span>AuraMail</span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
            <a href="#product" className="hover:text-foreground">Product</a>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
