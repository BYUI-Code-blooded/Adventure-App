"use client";

// Comments section at the bottom of an event card. Each card keeps its own open/closed and form state.
// The panel (and its auth + comments queries) is only mounted once the section has been opened.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { errorClass, primaryClass, secondaryClass } from "@/components/auth/styles";
import { useAuthProfile } from "@/components/auth/useAuthProfile";
import { useEventComments, type EventCommentWithAuthor } from "@/components/events/useEventComments";
import { COMMENT_MAX, formatCommentTime, validateComment } from "@/lib/comments";

const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

function CommentItem({ comment, canDelete, onRemove }: {
  comment: EventCommentWithAuthor;
  canDelete: boolean;
  onRemove: (id: string) => Promise<string | null>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const author = comment.author_name ?? "a former member";

  async function confirmDelete() {
    setBusy(true);
    const result = await onRemove(comment.id);
    setBusy(false);
    setConfirming(false);
    if (result) setMessage(result);
  }

  return (
    <li className="rounded-2xl bg-emerald-100/60 p-4">
      <p className="break-words text-sm font-bold text-emerald-700">
        {author}
        {" · "}
        <time dateTime={comment.created_at} className="font-semibold text-emerald-900/80">{formatCommentTime(comment.created_at)}</time>
      </p>
      <p className="mt-1 whitespace-pre-line break-words text-emerald-950">{comment.body}</p>
      {canDelete && !confirming && (
        <button
          type="button"
          onClick={() => { setMessage(""); setConfirming(true); }}
          aria-label={`Delete comment by ${author}`}
          className={`-ml-2 min-h-11 cursor-pointer rounded-lg px-2 text-sm font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-950 ${focusClass}`}
        >
          Delete
        </button>
      )}
      {canDelete && confirming && (
        <div className="mt-1 flex flex-wrap items-center gap-2" role="group" aria-label={`Confirm deleting comment by ${author}`}>
          <span className="text-sm font-semibold">Delete this comment?</span>
          <button type="button" disabled={busy} onClick={() => void confirmDelete()} className={`min-h-11 cursor-pointer rounded-full bg-emerald-900 px-4 text-sm font-bold text-amber-50 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}>
            {busy ? "Deleting…" : "Yes"}
          </button>
          <button type="button" disabled={busy} onClick={() => setConfirming(false)} className={`min-h-11 cursor-pointer rounded-full border-2 border-emerald-900 px-4 text-sm font-semibold hover:bg-emerald-900 hover:text-amber-50 disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}>
            No
          </button>
        </div>
      )}
      {message && <p role="alert" className="mt-2 rounded-2xl bg-amber-100 p-3 text-sm font-semibold">{message}</p>}
    </li>
  );
}

function CommentsPanel({ eventId, signedIn, userId, onCount }: {
  eventId: string;
  signedIn: boolean;
  userId?: string;
  onCount: (count: number) => void;
}) {
  const [text, setText] = useState("");
  const [formError, setFormError] = useState("");
  const [posting, setPosting] = useState(false);
  const postingRef = useRef(false);
  const mounted = useRef(true);
  const { profile } = useAuthProfile();
  const { comments, loaded, error, reload, post, remove } = useEventComments({ eventId, enabled: true });
  const isStaff = profile?.role === "admin" || profile?.role === "developer";
  const textId = `comment-text-${eventId}`;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Tell the header the real count once the list has loaded (and after every post or delete).
  useEffect(() => {
    if (loaded) onCount(comments.length);
  }, [loaded, comments.length, onCount]);

  async function submit(submitEvent: React.FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (postingRef.current) return;
    const invalid = validateComment(text);
    if (invalid) {
      setFormError(invalid);
      return;
    }
    postingRef.current = true;
    setPosting(true);
    setFormError("");
    const result = await post(text);
    postingRef.current = false;
    if (!mounted.current) return;
    setPosting(false);
    if (result) {
      setFormError(result);
      return;
    }
    setText("");
  }

  return (
    <>
      {!loaded && !error && <p role="status" className="text-sm text-emerald-900/80">Loading comments…</p>}
      {error && (
        <div role="alert" className="rounded-2xl bg-amber-100 p-4">
          <p className="font-semibold">We couldn&apos;t load the comments.</p>
          <button type="button" onClick={reload} className={`mt-3 ${secondaryClass} sm:w-auto`}>Try again</button>
        </div>
      )}
      {loaded && comments.length === 0 && <p className="text-sm text-emerald-900/80">No comments yet. Start the conversation.</p>}
      {comments.length > 0 && (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={isStaff || (!!userId && comment.author_id === userId)}
              onRemove={remove}
            />
          ))}
        </ul>
      )}
      {signedIn ? (
        <form onSubmit={(submitEvent) => void submit(submitEvent)} className="mt-4" noValidate>
          <label htmlFor={textId} className="block text-sm font-bold">Add a comment</label>
          <textarea
            id={textId}
            value={text}
            onChange={(changeEvent) => setText(changeEvent.target.value)}
            maxLength={COMMENT_MAX}
            rows={3}
            className="mt-1 w-full rounded-2xl border-2 border-emerald-900 bg-amber-50 px-4 py-3 text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          />
          <p className="mt-1 text-right text-xs text-emerald-900/80" aria-live="off">{text.length} / {COMMENT_MAX}</p>
          {formError && <p role="alert" className={errorClass}>{formError}</p>}
          <button type="submit" disabled={posting} className={`mt-3 ${primaryClass} sm:w-auto`}>
            {posting ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : (
        <Link href="/login" className={`mt-4 block ${secondaryClass} sm:w-auto`}>Sign in to comment</Link>
      )}
    </>
  );
}

export default function EventComments({ eventId, commentCount, signedIn, userId }: {
  eventId: string;
  commentCount: number;
  signedIn: boolean;
  userId?: string;
}) {
  const [open, setOpen] = useState(false);
  // Once opened, the panel stays mounted (just hidden) so reopening shows the list without a loading flash.
  const [everOpened, setEverOpened] = useState(false);
  const [loadedCount, setLoadedCount] = useState<number | null>(null);
  const panelId = `comments-${eventId}`;

  return (
    <section className="mt-4 w-full border-t border-emerald-900/15 pt-2" aria-label="Comments">
      <h4>
        <button
          type="button"
          onClick={() => { setOpen((value) => !value); setEverOpened(true); }}
          aria-expanded={open}
          aria-controls={panelId}
          className={`min-h-11 w-full cursor-pointer rounded-lg py-2 text-left text-sm font-bold text-emerald-700 hover:text-emerald-950 ${focusClass}`}
        >
          Comments ({loadedCount ?? commentCount})
        </button>
      </h4>
      <div id={panelId} hidden={!open} className="mt-2">
        {everOpened && <CommentsPanel eventId={eventId} signedIn={signedIn} userId={userId} onCount={setLoadedCount} />}
      </div>
    </section>
  );
}
