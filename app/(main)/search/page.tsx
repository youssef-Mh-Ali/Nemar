"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Search as SearchIcon, LayoutGrid, List } from "lucide-react";
import { Button, SkeletonUnitCard } from "@/components/ui";
import { FilterDrawer, DesktopFilters, UnitCard } from "@/components/search";
import { useAppStore } from "@/lib/store";
import { searchUnits } from "@/lib/api-client";
import { Unit } from "@/lib/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const { filters, setFilters, setFilterDrawerOpen } = useAppStore();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Set initial filter from URL params
  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (projectId) {
      setFilters({ ...filters, projectId });
    }
  }, [searchParams]);

  // Fetch units when filters change
  useEffect(() => {
    async function loadUnits() {
      setIsLoading(true);
      try {
        const response = await searchUnits(filters);
        if (response.success && response.data) {
          setUnits(response.data);
        }
      } catch (error) {
        console.error("Error loading units:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUnits();
  }, [filters]);

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined
  ).length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-[var(--color-bg-card)] border-b border-[var(--color-border-light)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Title & Count */}
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text)]">
                البحث عن وحدة
              </h1>
              <p className="text-sm text-[var(--color-text-muted)]">
                {isLoading ? "جاري البحث..." : `${units.length} وحدة`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* View Toggle - Desktop */}
              <div className="hidden md:flex items-center bg-[var(--color-bg-alt)] rounded-[var(--radius-md)] p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-[var(--radius-sm)] transition-colors ${
                    viewMode === "grid"
                      ? "bg-[var(--color-bg-card)] shadow-sm"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-[var(--radius-sm)] transition-colors ${
                    viewMode === "list"
                      ? "bg-[var(--color-bg-card)] shadow-sm"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Button - Mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterDrawerOpen(true)}
                className="md:hidden relative"
              >
                <SlidersHorizontal className="w-4 h-4" />
                تصفية
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-primary)] text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <div className="sticky top-36">
              <DesktopFilters />
            </div>
          </div>

          {/* Units Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-4"
                }
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonUnitCard key={i} />
                ))}
              </div>
            ) : units.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <SearchIcon className="w-16 h-16 text-[var(--color-border)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                  لا توجد نتائج
                </h3>
                <p className="text-[var(--color-text-muted)] mb-4">
                  جرب تغيير معايير البحث للعثور على وحدات أخرى
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFilterDrawerOpen(true)}
                  className="md:hidden"
                >
                  تعديل الفلاتر
                </Button>
              </motion.div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-4"
                }
              >
                {units.map((unit, index) => (
                  <UnitCard key={unit.id} unit={unit} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

