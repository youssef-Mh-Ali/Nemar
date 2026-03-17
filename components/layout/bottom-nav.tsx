"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, Building2, MoreHorizontal } from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "الرئيسية",
    labelEn: "Home",
    icon: Home,
  },
  {
    href: "/search",
    label: "البحث",
    labelEn: "Search",
    icon: Search,
  },
  {
    href: "/community",
    label: "مجتمعي",
    labelEn: "Community",
    icon: Building2,
  },
  {
    href: "/contact",
    label: "المزيد",
    labelEn: "More",
    icon: MoreHorizontal,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-card)] border-t border-[var(--color-border-light)] safe-bottom md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[var(--color-primary)] rounded-b-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 mb-1 transition-colors ${
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              />
              <span
                className={`text-xs transition-colors ${
                  isActive
                    ? "text-[var(--color-primary)] font-medium"
                    : "text-[var(--color-text-muted)]"
                }`}
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

