/**
 * BottomNavMobile — floating rounded bottom navigation (mobile only)
 *
 * 5 slots: Beranda · Produk · [N logo center] · Journal · Lainnya
 */

"use client";

import Link from "next/link";
import { Home, Grid3x3, BookOpen, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const navItems = [
  { label: "Beranda", url: "/", icon: Home, match: (p: string) => p === "/" },
  { label: "Produk", url: "/produk", icon: Grid3x3, match: (p: string) => p.startsWith("/produk") },
  { label: "", url: "#", icon: null, isCenter: true, match: () => false },
  { label: "Journal", url: "/journal", icon: BookOpen, match: (p: string) => p.startsWith("/journal") },
  { label: "Lainnya", url: "#more", icon: MoreHorizontal, match: () => false },
];

export function BottomNavMobile() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50">
      <div className="floating-nav grid grid-cols-[1fr_1fr_0.6fr_1fr_1fr] items-center py-2 px-1">
        {navItems.map((item, i) => {
          if (item.isCenter) {
            return (
              <div key={i} className="flex justify-center">
                <Link
                  href={item.url}
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

          const Icon = item.icon!;
          const isActive = item.match(pathname);

          return (
            <Link
              key={i}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center py-1 transition-colors",
                isActive ? "text-ink-primary" : "text-ink-secondary"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span
                className={cn(
                  "text-[9px] mt-0.5",
                  isActive && "font-medium"
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
