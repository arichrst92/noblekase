/**
 * TopNav — floating rounded navbar (sticky top)
 *
 * Hidden on mobile (replaced by hamburger + bottom nav).
 * Shows brand wordmark, menu links, language toggle, search icon.
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Menu } from "lucide-react";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  url: string;
}

const defaultNavItems: NavItem[] = [
  { label: "Beranda", url: "/" },
  { label: "Produk", url: "/produk" },
  { label: "Tentang", url: "/tentang" },
  { label: "Journal", url: "/journal" },
  { label: "Dukungan", url: "/dukungan" },
];

interface TopNavProps {
  navItems?: NavItem[];
  brand?: string;
}

export function TopNav({ navItems, brand = "NOBLEKASE" }: TopNavProps) {
  const items = navItems && navItems.length ? navItems : defaultNavItems;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-3 md:top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-auto max-w-[95vw]">
      <nav
        className={cn(
          "floating-nav flex items-center gap-3 md:gap-5 px-4 md:px-6 py-2.5 md:py-3",
          "transition-all duration-300",
          scrolled && "shadow-lift backdrop-blur-md bg-bg-base/95"
        )}
      >
        {/* Mobile: hamburger + brand + search */}
        <button
          className="md:hidden p-1"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4 text-ink-primary" />
        </button>

        <Link
          href="/"
          className="font-serif font-medium tracking-[0.15em] text-[13px] md:text-sm text-ink-primary"
        >
          {brand}
        </Link>

        {/* Desktop: nav links */}
        <ul className="hidden md:flex items-center gap-4 text-[12px] text-ink-secondary">
          {items.map((item) => (
            <li key={item.url}>
              <Link
                href={item.url}
                className="hover:text-ink-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 ml-auto md:ml-2">
          <button
            className="hidden md:inline-flex px-2.5 py-1 bg-bg-warm rounded-full text-[10px] text-ink-secondary hover:bg-bg-cream transition-colors"
            aria-label="Switch language"
          >
            ID/EN
          </button>
          <button
            className="p-1.5 md:px-2.5 md:py-1 md:bg-bg-warm md:rounded-full text-ink-secondary hover:text-ink-primary transition-colors"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 md:hidden" />
            <span className="hidden md:inline text-[10px]">⌕</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
