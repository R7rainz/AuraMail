import { describe, expect, it } from "vitest";
import type { PlacementEmail } from "../types";
import { groupEmailThreads } from "./emailThreads";

const email = (id: string, threadId: string | undefined, receivedAt: string) =>
  ({
    id,
    gmailMessageId: id,
    threadId,
    receivedAt,
    subject: id,
    sender: "VIT",
    snippet: "",
    company: null,
    role: null,
    deadline: null,
    applyLink: null,
    eligibility: null,
    timings: null,
    salary: null,
    location: null,
  }) as PlacementEmail;

describe("groupEmailThreads", () => {
  it("uses the newest message as the conversation representative", () => {
    const grouped = groupEmailThreads([
      email("older", "thread-1", "2026-07-10T09:00:00Z"),
      email("newer", "thread-1", "2026-07-11T09:00:00Z"),
      email("single", undefined, "2026-07-09T09:00:00Z"),
    ]);

    expect(grouped).toHaveLength(2);
    expect(grouped[0].id).toBe("newer");
    expect(grouped[0].followupCount).toBe(1);
    expect(grouped[0].threadMessages?.map((item) => item.id)).toEqual([
      "newer",
      "older",
    ]);
  });
});
