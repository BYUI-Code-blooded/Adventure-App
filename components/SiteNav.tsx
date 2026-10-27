"use client";

// Site-wide navigation, rendered once in app/layout.tsx.
// Mobile: top bar with the logo + fixed bottom tab bar. Desktop (md+): links move into the top bar.
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/components/icons";

function LogoSlot() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/adventure-app-brand-horizontal.png"
      alt="Rexburg Adventures"
      width={288}
      height={96}
      className="h-14 w-auto max-w-[58vw] rounded-lg bg-amber-50 px-2 py-1 object-contain md:h-20 md:max-w-[18rem]"
    />
  );
}

function isActive(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}

export default function SiteNav() {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);

  // Loads the Supabase client lazily so a missing .env.local never breaks the other pages.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    import("@/lib/supabase")
      .then(({ supabase }) => {
        const { data } = supabase.auth.onAuthStateChange((_event, session) =>
          setSignedIn(Boolean(session)),
        );
        unsubscribe = () => data.subscription.unsubscribe();
      })
      .catch(() => {});
    return () => unsubscribe?.();
  }, []);

  return (
    <>
      {/* z-[1100] keeps the header and bottom bar above Leaflet's map panes and controls (z-index up to 1000) on /map. */}
      <header className="sticky top-0 z-[1100] bg-emerald-900 text-amber-50">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 md:h-24">
          <Link href="/" aria-label="Rexburg Adventures home" className="flex shrink-0 items-center">
            <LogoSlot />
          </Link>
          <div className="flex items-center gap-1">
            <nav aria-label="Main" className="hidden md:block">
              <ul className="flex gap-1">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive(pathname, href) ? "page" : undefined}
                      className="rounded-full px-4 py-2 text-sm font-medium hover:bg-emerald-800 aria-[current=page]:bg-amber-300 aria-[current=page]:text-emerald-950"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <Link
              href={signedIn ? "/account" : "/login"}
              aria-current={isActive(pathname, signedIn ? "/account" : "/login") ? "page" : undefined}
              className="ml-2 rounded-full bg-amber-300 px-4 py-2 text-sm font-bold text-emerald-950 hover:bg-amber-200"
            >
              {signedIn ? "Account" : "Sign in"}
            </Link>
          </div>
        </div>
      </header>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-[1100] border-t border-emerald-800 bg-emerald-900 pb-[env(safe-area-inset-bottom)] text-emerald-200 md:hidden"
      >
        <ul className="grid grid-cols-4">
          {navLinks.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium hover:text-amber-50 aria-[current=page]:text-amber-300"
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
