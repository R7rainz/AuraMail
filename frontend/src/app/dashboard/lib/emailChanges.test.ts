import { describe, expect, it } from "vitest";
import { detectChanges } from "./emailChanges";
import type { PlacementEmail } from "../types";

function makeEmail(overrides: Partial<PlacementEmail>): PlacementEmail {
  return {
    id: "1",
    gmailMessageId: "1",
    subject: "Test",
    sender: "a@b.com",
    snippet: "",
    receivedAt: new Date().toISOString(),
    company: null,
    role: null,
    deadline: null,
    applyLink: null,
    eligibility: null,
    timings: null,
    salary: null,
    location: null,
    ...overrides,
  };
}

describe("detectChanges", () => {
  it("returns no changes when the list is unchanged", () => {
    const prev = [makeEmail({ id: "1" })];
    const result = detectChanges(prev, prev);
    expect(result.followups).toHaveLength(0);
    expect(result.newEmails).toHaveLength(0);
  });

  it("classifies a brand new email (no matching threadId) as new", () => {
    const prev = [makeEmail({ id: "1", threadId: "t1" })];
    const next = [...prev, makeEmail({ id: "2", threadId: "t2" })];
    const result = detectChanges(prev, next);
    expect(result.newEmails.map((e) => e.id)).toEqual(["2"]);
    expect(result.followups).toHaveLength(0);
  });

  it("classifies a new message on a known thread as a followup", () => {
    const prev = [makeEmail({ id: "1", threadId: "t1" })];
    const next = [...prev, makeEmail({ id: "2", threadId: "t1" })];
    const result = detectChanges(prev, next);
    expect(result.followups.map((e) => e.id)).toEqual(["2"]);
    expect(result.newEmails).toHaveLength(0);
  });

  it("treats emails without a threadId as new, never as followups", () => {
    const prev = [makeEmail({ id: "1", threadId: undefined })];
    const next = [...prev, makeEmail({ id: "2", threadId: undefined })];
    const result = detectChanges(prev, next);
    expect(result.newEmails.map((e) => e.id)).toEqual(["2"]);
    expect(result.followups).toHaveLength(0);
  });

  it("ignores emails removed between polls", () => {
    const prev = [makeEmail({ id: "1" }), makeEmail({ id: "2" })];
    const next = [makeEmail({ id: "1" })];
    const result = detectChanges(prev, next);
    expect(result.followups).toHaveLength(0);
    expect(result.newEmails).toHaveLength(0);
  });
});
