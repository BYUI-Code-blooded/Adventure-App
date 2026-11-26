"use client";

// Comments for one event (loaded only when enabled), with the author's name, plus posting and deleting as the current user.
import { useCallback, useEffect, useState } from "react";
import { validateComment } from "@/lib/comments";
import { supabase } from "@/lib/supabase";
import type { EventComment } from "@/lib/types";

// author_name is null when the author deleted their account ("a former member").
export type EventCommentWithAuthor = EventComment & { author_name: string | null };

export function useEventComments({ eventId, enabled }: { eventId: string; enabled: boolean }) {
  const [comments, setComments] = useState<EventCommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    async function loadComments() {
      setLoading(true);
      setError(false);
      const commentsResult = await supabase
        .from("event_comments")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });

      if (!active) return;
      if (commentsResult.error) {
        setError(true);
        setLoading(false);
        return;
      }

      const rows = (commentsResult.data ?? []) as EventComment[];
      const authorIds = [...new Set(rows.map((row) => row.author_id).filter((id): id is string => id !== null))];
      const namesResult =
        authorIds.length > 0
          ? await supabase.from("public_profiles").select("id, name").in("id", authorIds)
          : { data: [], error: null };

      if (!active) return;
      if (namesResult.error) {
        setError(true);
      } else {
        const names = new Map((namesResult.data ?? []).map((row: { id: string; name: string | null }) => [row.id, row.name]));
        setComments(rows.map((row) => ({ ...row, author_name: row.author_id ? names.get(row.author_id) ?? null : null })));
      }
      setLoading(false);
    }

    void loadComments().catch(() => {
      if (!active) return;
      setError(true);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [enabled, eventId, reloadKey]);

  /** Returns an error message, or null when it worked. The caller keeps the user's text on failure. */
  async function post(body: string) {
    const invalid = validateComment(body);
    if (invalid) return invalid;
    const { error: postError } = await supabase.from("event_comments").insert({ event_id: eventId, body: body.trim() });
    if (postError) {
      const denied = postError.code === "42501" || /row-level security|permission denied|jwt/i.test(postError.message);
      return denied ? "You need to sign in to comment." : "We couldn't post your comment. Please try again.";
    }
    reload();
    return null;
  }

  /** Returns an error message, or null when it worked. */
  async function remove(commentId: string) {
    const { error: removeError } = await supabase.from("event_comments").delete().eq("id", commentId);
    if (removeError) return "We couldn't delete your comment. Please try again.";
    reload();
    return null;
  }

  return { comments, loading, error, reload, post, remove };
}
