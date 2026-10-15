"use client";

// Site-wide navigation, rendered once in app/layout.tsx.
// Mobile: top bar with the logo + fixed bottom tab bar. Desktop (md+): links move into the top bar.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/components/icons";

// Placeholder name and logo until the team picks real ones.
export const SITE_NAME = "The Rexburg Field Guide";

function LogoSlot() {
  return (
    <div className="grid size-9 place-items-center rounded-full border border-stone-900 text-[9px] font-bold tracking-wider">
      LOGO
    </div>
  );
}

function isActive(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="border-b border-stone-300 bg-stone-50 text-stone-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <LogoSlot />
            <span className="font-serif text-xl italic">{SITE_NAME}</span>
          </Link>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex gap-8 text-sm font-medium">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(pathname, href) ? "page" : undefined}
                    className="border-b-2 border-transparent py-5 hover:border-stone-400 aria-[current=page]:border-orange-600"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* z-[1100] keeps the bar above Leaflet's map controls (z-index 1000) on /map. */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-[1100] border-t border-stone-300 bg-stone-50 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-4">
          {navLinks.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                className="flex flex-col items-center gap-1 border-t-2 border-transparent py-2.5 text-[11px] font-medium text-stone-500 aria-[current=page]:border-orange-600 aria-[current=page]:text-stone-900"
              >
                <Icon className="size-6" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
