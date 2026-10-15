# Gotchas

## Confirmed
1. Leaflet needs `window`, so it crashes the server build. Load the map with `dynamic(() => import(...), { ssr: false })` inside a Client Component (a file that starts with `'use client'`). `ssr: false` is not allowed in Server Components, so `app/map/page.tsx` should import a small client wrapper that does the dynamic import.
2. Import `leaflet/dist/leaflet.css` in the map component. The map container needs an explicit height (for example `h-[70vh]`), or the map is invisible.
3. Day filter: group events by day in the `America/Denver` time zone, using `timestamptz`. Otherwise an evening event can show on the wrong day.
4. Anonymous Supabase users use the `authenticated` role, so a policy that says "authenticated can write" includes them. Test the RLS policies early.
5. Anonymous sign-ins are limited to 30 per hour per IP by default. People on the same network (for example campus Wi-Fi) share an IP and can hit the limit. Sign in anonymously only on the first write action, and raise the limit in the Supabase dashboard (Auth, Rate Limits) if needed.
6. Free Supabase projects pause after 7 days of low activity. Resume the project from the dashboard (possible for up to a year) and warn the team before demos.
7. Static export does not support API routes that read the request, the proxy (middleware), Server Actions, cookies, redirects, rewrites, headers, or the default image optimizer. Dynamic routes need `generateStaticParams()`. Use `images: { unoptimized: true }` and call Supabase from the browser.
8. `NEXT_PUBLIC_*` variables are baked in at build time. Set them in the Vercel project settings and redeploy after changing them. Always write them literally (`process.env.NEXT_PUBLIC_SUPABASE_URL`); dynamic lookups such as `process.env[name]` are not inlined and arrive as `undefined` in the browser.
9. OpenStreetMap tiles: keep the attribution "© OpenStreetMap contributors" visible on the map, use the HTTPS tile URL, and do not strip the Referer header (no `Referrer-Policy: no-referrer`). Availability is best-effort.
10. Enable RLS explicitly on every table in `supabase/schema.sql`. Show user text in the UI as plain text or JSX only, never as HTML strings (no `dangerouslySetInnerHTML`, no HTML strings in Leaflet popups; use react-leaflet `<Popup>` with JSX children).
11. Supabase now uses the publishable key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). The older `anon` key still works but is being retired.
12. react-leaflet 5 requires React 19. Do not upgrade packages without telling the tech lead.

## To verify later
13. Leaflet's default marker icons may show as broken images in Next.js, because Leaflet detects the icon path from CSS and bundlers rename the files. If so, copy `marker-icon.png`, `marker-icon-2x.png` and `marker-shadow.png` from `leaflet/dist/images` into `public/` and set `L.Icon.Default.mergeOptions({ iconUrl: '/marker-icon.png', iconRetinaUrl: '/marker-icon-2x.png', shadowUrl: '/marker-shadow.png' })` in the client map code.
14. Check that Vercel deploys commits from every teammate, not only the owner.
15. If email login is added later, test SMTP delivery first. The built-in Supabase email provider sends only 2 emails per hour.
