# Local Adventures & Activities Guide

A guide to things to do in Rexburg, Idaho (BYU-Idaho class project). It has static content pages (Home, Outdoor, Indoor, Food & Treats, Weekend Events, About/Contact/FAQ, How to Submit Ideas) and an interactive "App" page: a Rexburg map where anyone can click to create an event, others can join, the attendee count is shown, and events can be filtered by day.

## Stack
- Next.js (App Router) + TypeScript + Tailwind CSS, npm
- Static export, deployed on Vercel
- Leaflet + react-leaflet on OpenStreetMap tiles
- Supabase (Postgres + anonymous auth), called directly from the browser
- No custom backend

## Running locally
```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values
npm run dev
```
Open http://localhost:3000. Before merging, `npm run build` and `npm run lint` must pass.

## Folder map
- `app/` pages and layout (App Router)
- `components/` React components (`components/map/` for the map)
- `content/` JSON content read by the static pages at build time
- `lib/` Supabase client and shared types
- `supabase/` database schema (`schema.sql`)
- `docs/` architecture notes, gotchas and feature docs

## Git workflow
- No pull requests. Everyone can push to `main`.
- One branch per feature: `feature/<short-name>`.
- To finish a feature: `git pull origin main` into your branch, run `npm run build` and `npm run lint`, then merge into `main` yourself and push.
- Never run `git push --force`. Never commit secrets or `.env.local`.

## For AI agents
AI coding agents read `AGENTS.md` (rules and conventions) and the files in `docs/` (`architecture.md`, `gotchas.md`). Keep those up to date when the project changes.
