/**
 * BottomNavMobile — floating rounded bottom navigation (mobile only)
 *
 * 5 slots: Beranda · Produk · [N logo center] · Journal · Lainnya
 */

"use client";

import Link from "next/link";
import { Home, Grid3x3, BookOpen, MoreHorizontal, Info, LifeBuoy, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  grid: Grid3x3,
  "grid-3x3": Grid3x3,
  "book-open": BookOpen,
  "more-horizontal": MoreHorizontal,
  info: Info,
  "life-buoy": LifeBuoy,
};

interface MobileItem {
  label: string;
  url: string;
  icon?: string;
  isCenterLogo?: boolean;
}

const defaultItems: MobileItem[] = [
  { label: "Beranda", url: "/", icon: "home" },
  { label: "Produk", url: "/produk", icon: "grid" },
  { label: "", url: "#", isCenterLogo: true },
  { label: "Journal", url: "/journal", icon: "book-open" },
  { label: "Lainnya", url: "#more", icon: "more-horizontal" },
];

export function BottomNavMobile({ items }: { items?: MobileItem[] }) {
  const navItems = items && items.length ? items : defaultItems;
  const pathname = usePathname();

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : url.startsWith("/") && pathname.startsWith(url);

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50">
      <div className="floating-nav grid grid-cols-[1fr_1fr_0.6fr_1fr_1fr] items-center py-2 px-1">
        {navItems.map((item, i) => {
          if (item.isCenterLogo) {
            return (
              <div key={i} className="flex justify-center">
                <Link
                  href={item.url || "/"}
                  className={cn(
                    "inline-flex w-10 h-10 rounded-full bg-ink-primary text-bg-base",
                    "items-center justify-center font-serif text-sm tracking-wider",
                    "-mt-4 border-[3px] border-bg-base shadow-soft"
                  )}
                >
                  N
                </Link>
              </div>
            );
          }

          const Icon = iconMap[item.icon ?? ""] ?? MoreHorizontal;
          const active = isActive(item.url);

          return (
            <Link
              key={i}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center py-1 transition-colors",
                active ? "text-ink-primary" : "text-ink-secondary"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span
                className={cn(
                  "text-[9px] mt-0.5",
                  active && "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
