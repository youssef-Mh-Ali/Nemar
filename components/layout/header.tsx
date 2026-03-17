"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui";
import { User, LogOut, Home, Search, Building2, Phone } from "lucide-react";

const desktopNavItems = [
  { href: "/", label: "الرئيسية", labelEn: "Home", icon: Home },
  { href: "/search", label: "البحث", labelEn: "Search", icon: Search },
  { href: "/community", label: "مجتمعي", labelEn: "Community", icon: Building2 },
  { href: "/contact", label: "تواصل معنا", labelEn: "Contact", icon: Phone },
];

export function Header() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg-card)]/95 backdrop-blur-md border-b border-[var(--color-border-light)] safe-top">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/RiymarLogo.png"
            alt="ريمار"
            width={140}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {desktopNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium
                  transition-colors duration-200
                  ${
                    isActive
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm text-[var(--color-text-secondary)]">
                {user.firstName}
              </span>
              <button
                onClick={() => clearAuth()}
                className="p-2 rounded-full hover:bg-[var(--color-bg-alt)] transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5 text-[var(--color-text-muted)]" />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
