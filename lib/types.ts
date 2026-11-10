// Shared TypeScript types for activities and database rows.

export type Role = "user" | "developer" | "admin";

export type ActivityCategory = "indoor" | "outdoor" | "food" | "weekend";

// Review state of an activity: users suggest ideas as "pending"; staff approve or reject them.
export type ActivityStatus = "pending" | "approved" | "rejected";

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
  weekly_hours?: Record<string, { open: string; close: string } | null> | null;
  delivery_available?: boolean | null;
  google_rating?: number | null;
  google_maps_url?: string | null;
  google_rating_checked_at?: string | null;
  walkable_from_campus?: boolean | null;
  status?: ActivityStatus;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
};

// A row of public.profiles (the email lives in the Supabase auth user, not here).
export type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  role: Role;
};

// A row of public.events. Unlimited events have max_participants = null. An event has an address,
// coordinates, or both. The organizer is creator_id (null if they deleted their account).
export type Event = {
  id: string;
  activity_id: string | null;
  creator_id: string | null;
  name: string;
  description: string;
  address: string | null;
  lat: number | null;
  lon: number | null;
  start_time: string;
  end_time: string;
  max_participants: number | null;
};
