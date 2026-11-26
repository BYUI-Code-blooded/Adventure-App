// Shared form styles for the login and account pages (same pills as the rest of the site).
// scroll-mt/scroll-mb keep a field clear of the sticky header (h-20, md:h-24) and the phone bottom nav when it is scrolled into view.
// aria-invalid:* gives a field that failed validation a thicker red border (red-800 is also used for the Report button).
export const inputClass =
  "w-full scroll-mt-28 scroll-mb-24 rounded-full border-2 border-emerald-900 bg-amber-50 px-5 py-3 text-emerald-950 placeholder:text-emerald-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 aria-invalid:border-4 aria-invalid:border-red-800 md:scroll-mt-32 md:scroll-mb-8";
export const textareaClass =
  "w-full scroll-mt-28 scroll-mb-24 rounded-2xl border-2 border-emerald-900 bg-amber-50 px-5 py-3 text-emerald-950 placeholder:text-emerald-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 aria-invalid:border-4 aria-invalid:border-red-800 md:scroll-mt-32 md:scroll-mb-8";
export const primaryClass =
  "w-full rounded-full bg-emerald-900 px-6 py-3 text-center font-bold text-amber-50 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryClass =
  "w-full rounded-full border-2 border-emerald-900 px-6 py-3 text-center font-semibold hover:bg-emerald-900 hover:text-amber-50 disabled:cursor-not-allowed disabled:opacity-60";
export const errorClass = "mt-3 scroll-mt-28 scroll-mb-24 rounded-2xl bg-amber-100 p-4 font-semibold md:scroll-mt-32 md:scroll-mb-8";
