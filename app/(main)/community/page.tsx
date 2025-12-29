"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, Plus, FileText, User } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import { UnitCard } from "@/components/search";
import { CaseForm, CaseList } from "@/components/community";
import { useAuthStore } from "@/lib/store";
import { getMyUnits, getCases } from "@/lib/api-client";
import { Unit, Case } from "@/lib/types";

export default function CommunityPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [units, setUnits] = useState<Unit[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"units" | "cases">("units");
  const [isCaseFormOpen, setIsCaseFormOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    async function loadData() {
      setIsLoading(true);
      try {
        const [unitsRes, casesRes] = await Promise.all([
          getMyUnits(token || undefined),
          getCases(token || undefined),
        ]);

        if (unitsRes.success && unitsRes.data) {
          setUnits(unitsRes.data);
        }
        if (casesRes.success && casesRes.data) {
          setCases(casesRes.data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user, token, router]);

  const refreshCases = async () => {
    const casesRes = await getCases(token || undefined);
    if (casesRes.success && casesRes.data) {
      setCases(casesRes.data);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] text-white px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Logo */}
            <Image
              src="/BinSaedanLogo-White.png"
              alt="فيصل بن سعيدان"
              width={160}
              height={45}
              className="h-10 w-auto mb-6"
            />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/70 text-sm">مرحباً</p>
                <h1 className="text-xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
              </div>
            </div>
            <p className="text-white/80">
              مرحباً بك في مجتمع فيصل بن سعيدان
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <Building2 className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {units.length}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">وحداتي</p>
          </Card>
          <Card className="p-4 text-center">
            <FileText className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {cases.length}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">طلباتي</p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-2 bg-[var(--color-bg-alt)] p-1 rounded-[var(--radius-lg)]">
          <button
            onClick={() => setActiveTab("units")}
            className={`flex-1 py-2.5 px-4 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
              activeTab === "units"
                ? "bg-[var(--color-bg-card)] shadow-sm text-[var(--color-text)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            وحداتي
          </button>
          <button
            onClick={() => setActiveTab("cases")}
            className={`flex-1 py-2.5 px-4 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
              activeTab === "cases"
                ? "bg-[var(--color-bg-card)] shadow-sm text-[var(--color-text)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            طلباتي
            {cases.filter((c) => c.status === "New" || c.status === "InProgress").length > 0 && (
              <Badge variant="warning" className="mr-2">
                {cases.filter((c) => c.status === "New" || c.status === "InProgress").length}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-32 rounded-[var(--radius-lg)]" />
            ))}
          </div>
        ) : activeTab === "units" ? (
          <div>
            {units.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-[var(--color-border)] mx-auto mb-3" />
                <h3 className="font-semibold text-[var(--color-text)] mb-1">
                  لا توجد وحدات
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  لم يتم تسجيل أي وحدات باسمك
                </p>
                <Link href="/search">
                  <Button variant="primary">استكشف الوحدات</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {units.map((unit) => (
                  <UnitCard key={unit.id} unit={unit} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-end mb-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCaseFormOpen(true)}
              >
                <Plus className="w-4 h-4" />
                طلب جديد
              </Button>
            </div>
            <CaseList cases={cases} />
          </div>
        )}
      </div>

      {/* Case Form Modal */}
      <CaseForm
        isOpen={isCaseFormOpen}
        onClose={() => setIsCaseFormOpen(false)}
        units={units}
        onSuccess={refreshCases}
      />
    </div>
  );
}
