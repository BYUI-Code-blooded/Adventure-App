// Shared TypeScript types for activities and database rows.

export type Role = "user" | "developer" | "admin";

// A row of public.profiles (the email lives in the Supabase auth user, not here).
export type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  role: Role;
};
