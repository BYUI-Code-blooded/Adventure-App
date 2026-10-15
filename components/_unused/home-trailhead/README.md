# DO NOT USE

`HomeTrailhead.tsx` is an alternative home page design ("Trailhead": forest green and cream, mountain silhouette, category chips). It was not picked and is not imported anywhere. The live home page is `app/page.tsx`.

It is kept only in case the team wants to revisit this look. Do not import it into the site. If you want to use it, ask the team first and then move it into `app/page.tsx`.

It still compiles, so `npm run build` and `npm run lint` check it. If it breaks after a shared change (for example to `components/icons.tsx`), fix it or delete this folder.
