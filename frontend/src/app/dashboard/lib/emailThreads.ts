import type { PlacementEmail } from "../types";

function receivedTime(email: PlacementEmail): number {
  const value = new Date(email.receivedAt).getTime();
  return Number.isNaN(value) ? 0 : value;
}

export function groupEmailThreads(emails: PlacementEmail[]): PlacementEmail[] {
  const groups = new Map<string, PlacementEmail[]>();

  for (const email of emails) {
    const key = email.threadId || `message:${email.id}`;
    groups.set(key, [...(groups.get(key) || []), email]);
  }

  return Array.from(groups.values()).map((messages) => {
    const threadMessages = [...messages].sort(
      (a, b) => receivedTime(b) - receivedTime(a),
    );
    return {
      ...threadMessages[0],
      threadMessages,
      followupCount: Math.max(0, threadMessages.length - 1),
    };
  });
}
