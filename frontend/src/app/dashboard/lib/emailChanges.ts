import { toast } from "sonner";
import type { PlacementEmail } from "../types";

const TOAST_COALESCE_THRESHOLD = 3;

export interface EmailChanges {
  followups: PlacementEmail[];
  newEmails: PlacementEmail[];
}

// Classifies emails present in `next` but not in `prev`: a "followup" is a
// new message whose threadId was already represented among `prev`'s emails
// (i.e. a reply arrived on a thread the user has already seen).
export function detectChanges(
  prev: PlacementEmail[],
  next: PlacementEmail[],
): EmailChanges {
  const knownIds = new Set(prev.map((e) => e.id));
  const knownThreadIds = new Set(
    prev.filter((e) => e.threadId).map((e) => e.threadId as string),
  );

  const followups: PlacementEmail[] = [];
  const newEmails: PlacementEmail[] = [];

  for (const email of next) {
    if (knownIds.has(email.id)) continue;
    if (email.threadId && knownThreadIds.has(email.threadId)) {
      followups.push(email);
    } else {
      newEmails.push(email);
    }
  }

  return { followups, newEmails };
}

export function announceChanges({ followups, newEmails }: EmailChanges) {
  const total = followups.length + newEmails.length;
  if (total === 0) return;

  if (total > TOAST_COALESCE_THRESHOLD) {
    toast(`${total} new updates in your inbox`);
    return;
  }

  for (const email of followups) {
    toast(`New reply in "${email.subject}"`);
  }
  for (const email of newEmails) {
    toast(`New email: "${email.subject}"`);
  }
}
