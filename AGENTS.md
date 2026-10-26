# Local Adventures & Activities Guide

Static content pages (Home, Outdoor, Indoor, Food & Treats, Weekend Events, About/Contact/FAQ, How to Submit Ideas) plus an interactive "App" page: a Rexburg map where anyone can click to create an event (place, activity, day/time), others can join, the attendee count is shown, and events can be filtered by day.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS, npm
- Static export (`output: 'export'`, `images: { unoptimized: true }`), deployed on Vercel
- Leaflet + react-leaflet on OpenStreetMap tiles
- Supabase (Postgres + anonymous auth) called directly from the browser
- No custom backend

## Commands
- `npm run dev` start locally
- `npm run build` must pass before merging to main
- `npm run lint` must pass before merging to main

## Rules
- Do NOT create API routes, middleware (proxy), Server Actions ('use server') or any server-side code. The site is a static export and none of these work. If you think one is needed, stop and ask the tech lead first.
- Never use the Supabase secret key (service_role) anywhere in this project. If a query fails because of RLS, fix the policy; do not bypass it.
- Do not add dependencies unless the tech lead asked for it.
- Leaflet must be loaded with `dynamic(() => import(...), { ssr: false })` inside a Client Component ('use client').
- Never render user text as HTML.
- Do not use `next/image` without `unoptimized`.
- Do not edit `supabase/schema.sql` unless asked.
- Never commit secrets or `.env.local`.
- Tailwind only. Custom CSS only in `app/globals.css`.
- Do not change files unrelated to the task.
- For coordinates, use `lon` everywhere in new code; do not introduce new `lng` usage. The existing legacy `lng` compatibility fallback should be removed at a future cleanup date once older data/code no longer requires it.
- Never run `git push --force`.
- Do not merge or push unless the user asks you to.

## Git workflow
- No pull requests. Everyone can push to `main`.
- One branch per feature: `feature/<short-name>`.
- To finish a feature: `git pull origin main` into your branch, run `npm run build` and `npm run lint`, then merge into `main` yourself and push.

## Read on demand
- `docs/architecture.md` before changing structure, data flow or Supabase.
- `docs/gotchas.md` before touching the map, dates, Supabase, env vars or deployment.
- `docs/style-guide.md` before building or changing any page or UI component.
