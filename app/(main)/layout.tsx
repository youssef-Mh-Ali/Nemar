"use client";

import { Header, BottomNav, InstallBanner } from "@/components/layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Header />
      <main className="flex-1 main-content">{children}</main>
      <BottomNav />
      <InstallBanner />
    </div>
  );
}

