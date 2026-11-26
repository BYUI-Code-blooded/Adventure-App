"use client";

// After a failed submit, scroll to (and focus) the first thing that went wrong.
//
//   const { formRef, reportFailure } = useFocusFirstError();
//   <form ref={formRef} ...>
//   // in the submit handler, in the same tick as the setState calls that show the errors:
//   if (problems) { setErrors(problems); reportFailure(); return; }
//
// reportFailure only bumps a counter. The effect below runs after React has committed the
// new error messages to the DOM, so the elements it looks for exist by then.
import { useCallback, useEffect, useRef, useState } from "react";

function focusFirstError(form: HTMLFormElement | null) {
  if (!form) return;
  const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  // First invalid field in DOM order: scroll it to the middle of the screen, then focus without a second jump.
  const field = form.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (field) {
    field.scrollIntoView({ block: "center", behavior });
    field.focus({ preventScroll: true });
    return;
  }

  // An error that isn't tied to a field (a failed save, a bad code, a pin that is missing).
  form.querySelector<HTMLElement>('[role="alert"]')?.scrollIntoView({ block: "center", behavior });
}

export function useFocusFirstError() {
  const formRef = useRef<HTMLFormElement>(null);
  const [attempt, setAttempt] = useState(0);
  const reportFailure = useCallback(() => setAttempt((count) => count + 1), []);

  useEffect(() => {
    if (attempt > 0) focusFirstError(formRef.current);
  }, [attempt]);

  return { formRef, reportFailure };
}
