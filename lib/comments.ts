// Rules for event comments. The database enforces the same limit (see supabase/event-comments-migration.sql).
import { EVENT_TIME_ZONE } from "@/lib/events";

// Matches the check on event_comments.body (1 to 500 characters after trimming).
export const COMMENT_MAX = 500;

/** Returns a friendly message when the comment can't be posted, or null when it's fine. */
export function validateComment(value: string): string | null {
  const body = value.trim();
  if (body.length === 0) return "Write something before you post.";
  if (body.length > COMMENT_MAX) return `Keep your comment under ${COMMENT_MAX} characters.`;
  return null;
}

/** A comment's time in Rexburg time, like "Nov 7, 6:42 PM". Empty when the date is invalid. */
export function formatCommentTime(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
