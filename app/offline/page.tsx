"use client";

import Image from "next/image";
import { WifiOff, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui";

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <Image
          src="/FBS%20logo%20acronim.svg"
          alt="فيصل بن سعيدان"
          width={180}
          height={50}
          className="h-12 w-auto mx-auto mb-8"
        />

        {/* Icon */}
        <div className="w-20 h-20 bg-[var(--color-bg-alt)] rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-[var(--color-text-muted)]" />
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">
          لا يوجد اتصال بالإنترنت
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.
        </p>

        {/* Actions */}
        <Button variant="primary" size="lg" onClick={handleRefresh}>
          <RefreshCcw className="w-5 h-5" />
          إعادة المحاولة
        </Button>

        {/* Footer */}
        <p className="text-xs text-[var(--color-text-muted)] mt-8">
          فيصل بن سعيدان | Faisal Bin Saedan
        </p>
      </div>
    </div>
  );
}
