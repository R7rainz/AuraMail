// Example data for the landing demos. Companies are fictional.

export type DemoStatus = "urgent" | "soon" | "open";

export interface DemoMail {
  id: string;
  company: string;
  role: string;
  received: string;
  /** Hours until applications close. */
  hours: number;
  /** Share of the application window already spent, 0–1 (same rule as dashboard/lib/runway.ts). */
  spent: number;
  location: string;
  pay: string;
  eligibility: string;
  summary: string;
}

export const demoMail: Record<string, DemoMail> = {
  kestrel: {
    id: "kestrel",
    company: "Kestrel Analytics",
    role: "Data Science Intern",
    received: "Mon",
    hours: 5,
    spent: 0.93,
    location: "Bengaluru · Hybrid",
    pay: "₹60,000 / month",
    eligibility: "B.Tech CSE, IT, ECE · CGPA 7.5+",
    summary: "Online test on Saturday. Shortlisted students interview the following week.",
  },
  northwind: {
    id: "northwind",
    company: "Northwind Labs",
    role: "Product Engineer, 2027",
    received: "Yesterday",
    hours: 14,
    spent: 0.71,
    location: "Pune",
    pay: "₹18 LPA",
    eligibility: "All branches · No active backlogs",
    summary: "Fill the registration form and upload your resume as a single PDF.",
  },
  monsoon: {
    id: "monsoon",
    company: "Monsoon Robotics",
    role: "Embedded Systems Intern",
    received: "Yesterday",
    hours: 30,
    spent: 0.55,
    location: "Chennai",
    pay: "₹45,000 / month",
    eligibility: "ECE, EEE, EIE · CGPA 7.0+",
    summary: "Six-month internship starting January. Bring a project you can demo.",
  },
  halcyon: {
    id: "halcyon",
    company: "Halcyon Systems",
    role: "SDE Intern, Summer",
    received: "Tue",
    hours: 52,
    spent: 0.48,
    location: "Hyderabad",
    pay: "₹1,10,000 / month",
    eligibility: "CSE, IT · Graduating 2027",
    summary: "Two coding rounds and one system design conversation.",
  },
  orbital: {
    id: "orbital",
    company: "Orbital Freight",
    role: "Pre-placement talk",
    received: "Today",
    hours: 98,
    spent: 0.08,
    location: "Main auditorium",
    pay: "PPT · attendance required",
    eligibility: "Registered students only",
    summary: "Attendance is required to sit the online assessment.",
  },
  pinecrest: {
    id: "pinecrest",
    company: "Pinecrest Bank",
    role: "Technology Analyst",
    received: "Fri",
    hours: 216,
    spent: 0.18,
    location: "Mumbai",
    pay: "₹14 LPA",
    eligibility: "All branches · CGPA 8.0+",
    summary: "Resume shortlist first, then a group discussion on campus.",
  },
};

export const statusOf = (hours: number): DemoStatus =>
  hours < 24 ? "urgent" : hours < 72 ? "soon" : "open";

export const leftLabel = (hours: number) =>
  hours < 24 ? `${hours}h left` : `${Math.round(hours / 24)}d left`;

export const statusText: Record<DemoStatus, string> = {
  urgent: "text-urgent",
  soon: "text-soon",
  open: "text-open",
};

export const statusColor: Record<DemoStatus, string> = {
  urgent: "var(--urgent)",
  soon: "var(--soon)",
  open: "var(--open)",
};

const BASE = ["kestrel", "halcyon", "pinecrest"];
const ARRIVALS = ["northwind", "orbital", "monsoon"];
export const DEMO_FRAMES = ARRIVALS.length * 2 + 1;

const byDeadline = (ids: string[]) =>
  [...ids].sort((a, b) => demoMail[a].hours - demoMail[b].hours);

/**
 * Odd frames: a new email lands on top. Even frames: the inbox re-sorts by
 * deadline. The newest arrival stays selected so the eye follows it into place.
 */
export function demoFrame(step: number): { order: string[]; active: string } {
  if (step <= 0) return { order: byDeadline(BASE), active: byDeadline(BASE)[0] };
  const count = Math.ceil(step / 2);
  const latest = ARRIVALS[count - 1];
  const earlier = byDeadline([...BASE, ...ARRIVALS.slice(0, count - 1)]);
  return step % 2
    ? { order: [latest, ...earlier], active: latest }
    : { order: byDeadline([...earlier, latest]), active: latest };
}
