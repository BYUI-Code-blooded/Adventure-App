// Shared TypeScript types for activities and database rows.

export type Role = "user" | "developer" | "admin";

export type ActivityCategory = "indoor" | "outdoor" | "food" | "weekend";

export type Activity = {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  lat: number;
  lon: number;
  photo_url?: string | null;
  category: ActivityCategory;
  is_featured: boolean;
  created_by?: string | null;
  created_at: string;
  website_url?: string | null;
};

// A row of public.profiles (the email lives in the Supabase auth user, not here).
export type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  role: Role;
};
