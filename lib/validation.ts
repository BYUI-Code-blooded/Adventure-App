// Small input checks shared by the login and account pages.
// The database has matching check constraints (see supabase/schema.sql).

// Length of the email code. Must match "Email OTP Length" in the Supabase Auth settings.
export const CODE_LENGTH = 8;

export const NAME_MAX = 80;

/** Keeps only the digits of a pasted or typed code, capped at CODE_LENGTH. */
export function cleanCode(value: string) {
  return value.replace(/\D/g, "").slice(0, CODE_LENGTH);
}

export function isCodeComplete(code: string) {
  return code.length === CODE_LENGTH;
}

/** Returns an error message, or null when the name is fine. */
export function validateName(value: string) {
  const name = value.trim();
  if (!name) return "Please enter a name.";
  if (name.length > NAME_MAX) return `Keep it under ${NAME_MAX} characters.`;
  return null;
}

/**
 * Returns an error message, or null when the phone is valid or empty (it is optional).
 * Accepts digits with spaces, dashes, dots, parentheses and a leading +. It needs 7 to 15 digits.
 */
export function validatePhone(value: string) {
  const phone = value.trim();
  if (!phone) return null;
  if (!/^\+?[\d\s().-]+$/.test(phone)) {
    return "Use only numbers, spaces, dashes, parentheses and an optional + at the start.";
  }
  if (phone.length > 30) return "That phone number is too long.";
  const digits = phone.replace(/\D/g, "").length;
  if (digits < 7 || digits > 15) return "A phone number has between 7 and 15 digits.";
  return null;
}
