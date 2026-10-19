# Style Guide

This guide explains how the site should look so every page feels like part of the same site. The reference implementation is the home page (`app/page.tsx`) and the site nav (`components/SiteNav.tsx`). When in doubt, copy what those files do.

The look is called **Trailhead**: an outdoorsy, welcoming style. Deep forest green, warm cream, a bright golden accent, bold rounded type and soft rounded shapes, like a trail sign at a park entrance.

## 1. Design principles

1. **Forest and sunshine.** Dark forest green is the base color, cream is the page background, and golden yellow is the highlight. Together they should feel outdoorsy and friendly.
2. **Bold and confident type.** Headlines are big and heavy (`font-extrabold`). Body text stays calm and readable.
3. **Soft and rounded.** Buttons, chips and nav items are pills (`rounded-full`). Cards have generously rounded corners. Nothing has sharp corners.
4. **Strong bands.** Pages are built from full-width color bands (dark green, cream, light green) so sections are easy to tell apart when scrolling on a phone.
5. **Gold means "do this".** Golden yellow marks the most important action or the current page. Don't use it for decoration.
6. **Mobile first.** Write the phone layout first, then add `sm:`/`md:` classes for bigger screens. Every page must work at 360px wide.
7. **Plain and friendly copy.** Short sentences, everyday words, talk to the reader ("you").

## 2. Color

Only use Tailwind's `emerald` (greens) and `amber` (creams and gold) palettes. Don't add other color families without agreeing as a team.

| Role                 | Tailwind class            | Approx. hex           | Used for                                                                                                      |
| -------------------- | ------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Forest (base dark)   | `bg-emerald-900`          | `#064e3b`             | Header, bottom nav, hero band, icon circles, secondary dark buttons                                           |
| Forest hover         | `bg-emerald-800`          | `#065f46`             | Hover on dark buttons and nav items; bottom nav top border                                                    |
| Hill / accent green  | `emerald-700`             | `#047857`             | Back layer of the mountain silhouette; small labels ("Step 1") on cream                                       |
| Ink                  | `text-emerald-950`        | `#022c22`             | Default text color on cream and gold backgrounds                                                              |
| Soft ink             | `text-emerald-900/80`     | —                     | Body paragraphs on cream                                                                                      |
| Light text on dark   | `text-emerald-100`        | `#d1fae5`             | Paragraphs inside dark green bands                                                                            |
| Inactive nav on dark | `text-emerald-200`        | `#a7f3d0`             | Bottom nav items that aren't the current page                                                                 |
| Light band           | `bg-emerald-100/60`       | —                     | Alternating full-width sections on cream                                                                      |
| Cream (page)         | `bg-amber-50`             | `#fffbeb`             | Default page background, cards on light-green bands, headline text on dark                                    |
| Pale cream           | `amber-100` / `amber-200` | `#fef3c7` / `#fde68a` | Faint borders and outlines on dark green (`border-amber-100/40`), primary button hover                        |
| Gold (accent)        | `amber-300`               | `#fcd34d`             | Primary buttons, current nav item, eyebrow labels on dark, call-to-action panels, icons inside forest circles |

Rules:

- **Every page sets `bg-amber-50 text-emerald-950` on its outer wrapper** (see the page template in section 10). `app/globals.css` darkens the page when the OS is in dark mode. There is no dark mode design yet, so pages must set their own colors.
- **Gold is for action and "you are here".** Use it for primary buttons, the current nav item, call-to-action panels and small labels on dark green. Never use gold text on cream (unreadable).
- Text on dark green is `amber-50` (headlines), `emerald-100` (paragraphs) or `amber-300` (labels). Text on cream or gold is `emerald-950` or `emerald-900/80`.
- On cream, small colored text uses `emerald-700`. Lighter greens than that are too faint for text on cream.
- Use at most one gold panel per page, so it stays special.

## 3. Typography

One sans-serif font family for everything. The personality comes from weight and size, not from mixing fonts.

| Element                     | Classes                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Page title (h1)             | `text-4xl font-extrabold leading-tight md:text-6xl` (limit width with `max-w-2xl`) |
| Section heading (h2)        | `text-2xl font-extrabold md:text-3xl`                                              |
| Card / item heading (h3)    | `text-lg font-bold`                                                                |
| Eyebrow label (above h1)    | `text-sm font-semibold uppercase tracking-widest` (`text-amber-300` on dark)       |
| Intro / lead paragraph      | `text-lg` (`text-emerald-100` on dark), max width `max-w-xl`                       |
| Body paragraph              | base size, `text-emerald-900/80` on cream                                          |
| Small label (e.g. "Step 1") | `text-sm font-bold text-emerald-700`                                               |
| Button text                 | `font-bold` (primary) or `font-semibold` (secondary)                               |
| Nav text                    | `text-sm font-medium` (desktop), `text-[11px] font-medium` (bottom bar)            |
| Site name                   | `font-bold leading-tight`, with the last word in `text-amber-300`                  |

Rules:

- One `h1` per page. Don't skip heading levels.
- Use sentence case for headings ("How it works", not "How It Works"). Only eyebrow labels are uppercase.
- Headings are `font-extrabold`. Don't use `font-black` or thin weights.
- Keep paragraphs to a readable width (`max-w-xl` to `max-w-2xl`, or a grid column).

## 4. Layout and spacing

- **Content container:** `mx-auto max-w-6xl px-4`. Every section's content sits in this container so its edges line up with the header.
- **Section padding:** `py-12 md:py-16`. The hero uses `pt-10 pb-28 md:pt-20 md:pb-40` to leave room for the mountain silhouette.
- **Bands:** a page goes down like this: dark green hero → cream section → light-green band (`bg-emerald-100/60`) → cream section. For a full-width band, put the container inside a `<section>` with the band color. Don't place two bands of the same color next to each other.
- **Spacing inside sections:** eyebrow to h1 `mt-3`; h1 to paragraph `mt-4`; heading to card grid `mt-8`; paragraph to buttons `mt-8`; between cards `gap-4`; between columns `gap-8`; between chips and buttons `gap-2` to `gap-3`.
- **Breakpoints:** design for phones first, then add:
  - `sm:` (640px) to put button groups side by side (`flex-col sm:flex-row`).
  - `md:` (768px) for the desktop layout: 2-column text + content (`md:grid-cols-2`), 3-column cards (`md:grid-cols-3`), and the nav moving to the header.
- **Bottom nav space:** on phones, the root layout adds bottom padding so the fixed bottom nav never covers content. Don't add your own. Full-screen elements (like the map) must leave room for the sticky header (`h-16`) and, on phones, the bottom nav.

## 5. Components

### Site navigation

- `components/SiteNav.tsx`, rendered once in `app/layout.tsx`. **Don't add a nav to individual pages.**
- Header: sticky, `bg-emerald-900`, `h-16`, logo and site name on the left.
- Phones: a fixed bottom tab bar (`bg-emerald-900`, icon above label). Inactive items are `emerald-200`, the current page is `amber-300`.
- Desktop (`md:`): pill links in the header; the current page is a gold pill (`bg-amber-300 text-emerald-950`), and the others turn `bg-emerald-800` on hover. The bottom bar is hidden.
- The current page gets `aria-current="page"` and is styled with `aria-[current=page]:` classes. Don't use separate "active" class logic.
- To add or rename a nav item, edit `navLinks` in `components/icons.tsx`. Keep the bottom bar to 4 items (5 at most) or the labels get cramped.
- Header and bottom bar use `z-[1100]` so they stay above the Leaflet map. Don't lower it.

### Buttons and links

| Kind                 | Classes                                                                                                     | When                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Primary              | `rounded-full bg-amber-300 px-6 py-3 text-center font-bold text-emerald-950 hover:bg-amber-200`             | The main action of a section. Max one per section           |
| Secondary on dark    | `rounded-full border border-amber-100/40 px-6 py-3 text-center font-semibold hover:bg-emerald-800`          | Second action next to a primary button in a dark green band |
| Dark on light        | `rounded-full bg-emerald-900 px-6 py-3 font-bold text-amber-50 hover:bg-emerald-800`                        | Main action inside a gold panel or on cream                 |
| Chip / category link | `rounded-full border-2 border-emerald-900 px-4 py-2 font-semibold hover:bg-emerald-900 hover:text-amber-50` | A set of short links (categories, filters)                  |

- Button groups stack on phones and sit side by side from `sm:` up: `flex flex-col gap-3 sm:flex-row`. Stacked buttons are full width, which makes them easy to tap.
- Use `<Link>` from `next/link` for internal links. Use `<button>` for actions that don't navigate.

### Cards

- `rounded-2xl bg-amber-50 p-6 shadow-sm`, usually on a light-green band.
- Card heading row: an icon circle (`grid size-10 place-items-center rounded-full bg-emerald-900 text-amber-300` with a `size-5` icon) + a small label (`text-sm font-bold text-emerald-700`).
- Then `h3` (`mt-4 text-lg font-bold`) and a paragraph (`mt-2 text-emerald-900/80`).
- Use `<ol>` for steps where order matters, `<ul>` otherwise.

### Call-to-action panel

- `rounded-3xl bg-amber-300 p-8`, with the heading and text on the left and a "dark on light" button on the right from `md:` up (`md:flex md:items-center md:justify-between`). On phones the button sits below with `mt-6`.
- Max one per page, near the bottom.

### Mountain silhouette (band divider)

- The hero ends with an SVG ridge line: a back layer filled with `fill-emerald-700` and a front layer filled with the color of the next section (`fill-amber-50`). It sits at the bottom of the band (`absolute inset-x-0 bottom-0 h-16 md:h-28`, `preserveAspectRatio="none"`, `aria-hidden="true"`).
- Use it only where a dark green band meets a cream section, and at most once or twice per page. Copy the paths from `app/page.tsx`. If the next section isn't cream, change the front layer's fill to match it.

### Images

- Rounded corners to match cards (`rounded-2xl`). Use plain `<img>` or `next/image` with `unoptimized` (static export), and always fill in `alt` (`alt=""` for decorative images).

### Logo and site name

- Both are placeholders in `SiteNav.tsx`: `LogoSlot` (a dashed `size-10 rounded-lg` box) and the "Rexburg **Adventures**" text. When the real ones arrive, replace them there only.

## 6. Shape, borders and depth

- **Corner radius scale:**
  - `rounded-full`: buttons, chips, nav pills, icon circles.
  - `rounded-lg`: the logo box and other small boxes.
  - `rounded-2xl`: cards and images.
  - `rounded-3xl`: large panels (call to action).
  - No square corners on visible boxes.
- **Borders:** `border-2 border-emerald-900` for chips; `border border-amber-100/40` for outline buttons on dark; `border-t border-emerald-800` for the bottom nav.
- **Shadows:** `shadow-sm` on cards only. No large shadows.
- **Gradients:** none. Use flat color bands, and the mountain silhouette for transitions.

## 7. Icons

- Inline SVG components in `components/icons.tsx`. No icon libraries (no new dependencies).
- Style: 24×24 viewBox, `fill="none"`, `stroke="currentColor"`, `strokeWidth={2}`, round caps and joins. New icons must match.
- Size `size-6` in the bottom nav, `size-5` inside icon circles and next to text. The color comes from the text color.
- Icons next to a text label get `aria-hidden="true"` (built into the `Svg` helper). Icon-only links/buttons need an `aria-label`.

## 8. Motion and interaction

- Use simple color changes on hover: a slightly lighter shade (`hover:bg-amber-200`, `hover:bg-emerald-800`), or a filled chip (`hover:bg-emerald-900 hover:text-amber-50`). No scaling, bouncing or slide-in animations.
- Don't remove browser focus outlines (`outline-none`) without adding a visible `focus-visible:` style.
- Tap targets on phones should be at least about 44px tall (the `py-3` buttons and the bottom nav already are).

## 9. Writing style

- Upbeat, warm and short: "Find your next adventure, and someone to go with." "Know a hidden gem?"
- Speak to the reader as "you". Don't use jargon or marketing talk.
- Button labels start with a verb: "Open the map", "Suggest an idea", "Submit an idea".
- Number steps as "Step 1", "Step 2", and so on.
- User-submitted text is shown as plain text only, never as HTML (see `AGENTS.md`).

## 10. New page template

Start new content pages from this so they match the home page:

```tsx
export default function ExamplePage() {
  return (
    <div className="flex flex-1 flex-col bg-amber-50 text-emerald-950">
      <main className="flex-1">
        <section className="bg-emerald-900 text-amber-50">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
              Section label
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
              Page title
            </h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-100">
              One or two sentence intro.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Section heading
          </h2>
          <p className="mt-4 text-emerald-900/80">Content.</p>
        </section>

        <section className="bg-emerald-100/60">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Another section
            </h2>
            {/* cards: rounded-2xl bg-amber-50 p-6 shadow-sm */}
          </div>
        </section>
      </main>
    </div>
  );
}
```

Add the mountain silhouette to the bottom of the hero band (and increase its bottom padding) only if the page has room for it. On smaller pages a plain band edge is fine.

## 11. Checklist before merging a UI change

- [ ] Works at 360px wide with no sideways scrolling, and looks right at `sm:`, `md:` and wider.
- [ ] Nothing is hidden behind the sticky header or the bottom nav.
- [ ] Only `emerald` and `amber` colors; gold is used for actions and the current page, never as text on cream.
- [ ] Outer wrapper sets `bg-amber-50 text-emerald-950`.
- [ ] Headings are `font-extrabold`; one `h1` per page.
- [ ] Buttons and chips are `rounded-full`; cards `rounded-2xl`; no gradients or large shadows.
- [ ] Content sits in `mx-auto max-w-6xl px-4`; sections use `py-12 md:py-16`.
- [ ] Tailwind classes only; custom CSS only in `app/globals.css`.
- [ ] Headings in order, images have `alt`, icon-only controls have `aria-label`, focus is visible.
