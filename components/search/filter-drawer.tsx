"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { Button, Select } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { getProjects } from "@/lib/api-client";
import { Project, Phase } from "@/lib/types";

const bedroomOptions = [
  { value: "", label: "الكل" },
  { value: "1", label: "1 غرفة" },
  { value: "2", label: "2 غرف" },
  { value: "3", label: "3 غرف" },
  { value: "4", label: "4 غرف" },
  { value: "5", label: "5+ غرف" },
];

const statusOptions = [
  { value: "", label: "الكل" },
  { value: "Available", label: "متاح" },
  { value: "Reserved", label: "محجوز" },
  { value: "Sold", label: "مباع" },
];

const priceOptions = [
  { value: "", label: "الكل" },
  { value: "0-1000000", label: "أقل من مليون ريال" },
  { value: "1000000-2000000", label: "1 - 2 مليون ريال" },
  { value: "2000000-3000000", label: "2 - 3 مليون ريال" },
  { value: "3000000-5000000", label: "3 - 5 مليون ريال" },
  { value: "5000000-999999999", label: "أكثر من 5 مليون ريال" },
];

const yearOptions = [
  { value: "", label: "الكل" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
];

export function FilterDrawer() {
  const { isFilterDrawerOpen, setFilterDrawerOpen, filters, setFilters, clearFilters } =
    useAppStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);

  // Local filter state
  const [localFilters, setLocalFilters] = useState({
    projectId: filters.projectId || "",
    phaseId: filters.phaseId || "",
    bedrooms: filters.bedrooms?.toString() || "",
    status: filters.status || "",
    priceRange: "",
    deliveryYear: filters.deliveryYear?.toString() || "",
  });

  useEffect(() => {
    async function loadProjects() {
      const response = await getProjects();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    }
    loadProjects();
  }, []);

  // Update phases when project changes
  useEffect(() => {
    if (localFilters.projectId) {
      const project = projects.find((p) => p.id === localFilters.projectId);
      setPhases(project?.phases || []);
    } else {
      setPhases([]);
    }
  }, [localFilters.projectId, projects]);

  // Sync with global filters
  useEffect(() => {
    setLocalFilters({
      projectId: filters.projectId || "",
      phaseId: filters.phaseId || "",
      bedrooms: filters.bedrooms?.toString() || "",
      status: filters.status || "",
      priceRange: "",
      deliveryYear: filters.deliveryYear?.toString() || "",
    });
  }, [filters]);

  const projectOptions = [
    { value: "", label: "جميع المشاريع" },
    ...projects.map((p) => ({ value: p.id, label: p.nameAr })),
  ];

  const phaseOptions = [
    { value: "", label: "جميع المراحل" },
    ...phases.map((p) => ({ value: p.id, label: p.nameAr })),
  ];

  const handleApply = () => {
    const [minPrice, maxPrice] = localFilters.priceRange
      ? localFilters.priceRange.split("-").map(Number)
      : [undefined, undefined];

    setFilters({
      projectId: localFilters.projectId || undefined,
      phaseId: localFilters.phaseId || undefined,
      bedrooms: localFilters.bedrooms ? parseInt(localFilters.bedrooms) : undefined,
      status: (localFilters.status as "Available" | "Reserved" | "Sold") || undefined,
      minPrice,
      maxPrice,
      deliveryYear: localFilters.deliveryYear
        ? parseInt(localFilters.deliveryYear)
        : undefined,
    });
    setFilterDrawerOpen(false);
  };

  const handleReset = () => {
    setLocalFilters({
      projectId: "",
      phaseId: "",
      bedrooms: "",
      status: "",
      priceRange: "",
      deliveryYear: "",
    });
    clearFilters();
  };

  const hasActiveFilters = Object.values(localFilters).some((v) => v !== "");

  return (
    <AnimatePresence>
      {isFilterDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFilterDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[var(--color-bg-card)] rounded-t-3xl max-h-[85vh] overflow-hidden md:hidden"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-4 border-b border-[var(--color-border-light)]">
              <h2 className="text-lg font-semibold">تصفية النتائج</h2>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    إعادة تعيين
                  </button>
                )}
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-2 hover:bg-[var(--color-bg-alt)] rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              <Select
                label="المشروع"
                options={projectOptions}
                value={localFilters.projectId}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    projectId: e.target.value,
                    phaseId: "",
                  })
                }
              />

              {localFilters.projectId && (
                <Select
                  label="المرحلة"
                  options={phaseOptions}
                  value={localFilters.phaseId}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, phaseId: e.target.value })
                  }
                />
              )}

              <Select
                label="عدد الغرف"
                options={bedroomOptions}
                value={localFilters.bedrooms}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, bedrooms: e.target.value })
                }
              />

              <Select
                label="نطاق السعر"
                options={priceOptions}
                value={localFilters.priceRange}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, priceRange: e.target.value })
                }
              />

              <Select
                label="الحالة"
                options={statusOptions}
                value={localFilters.status}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, status: e.target.value })
                }
              />

              <Select
                label="سنة التسليم"
                options={yearOptions}
                value={localFilters.deliveryYear}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, deliveryYear: e.target.value })
                }
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--color-border-light)] safe-bottom">
              <Button variant="primary" fullWidth onClick={handleApply}>
                تطبيق الفلاتر
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function DesktopFilters() {
  const { filters, setFilters, clearFilters } = useAppStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);

  useEffect(() => {
    async function loadProjects() {
      const response = await getProjects();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    if (filters.projectId) {
      const project = projects.find((p) => p.id === filters.projectId);
      setPhases(project?.phases || []);
    } else {
      setPhases([]);
    }
  }, [filters.projectId, projects]);

  const projectOptions = [
    { value: "", label: "جميع المشاريع" },
    ...projects.map((p) => ({ value: p.id, label: p.nameAr })),
  ];

  const phaseOptions = [
    { value: "", label: "جميع المراحل" },
    ...phases.map((p) => ({ value: p.id, label: p.nameAr })),
  ];

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="hidden md:block bg-[var(--color-bg-card)] border border-[var(--color-border-light)] rounded-[var(--radius-lg)] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--color-text)]">تصفية النتائج</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </button>
        )}
      </div>

      <div className="space-y-4">
        <Select
          label="المشروع"
          options={projectOptions}
          value={filters.projectId || ""}
          onChange={(e) =>
            setFilters({ ...filters, projectId: e.target.value || undefined, phaseId: undefined })
          }
        />

        {filters.projectId && (
          <Select
            label="المرحلة"
            options={phaseOptions}
            value={filters.phaseId || ""}
            onChange={(e) =>
              setFilters({ ...filters, phaseId: e.target.value || undefined })
            }
          />
        )}

        <Select
          label="عدد الغرف"
          options={bedroomOptions}
          value={filters.bedrooms?.toString() || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              bedrooms: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
        />

        <Select
          label="الحالة"
          options={statusOptions}
          value={filters.status || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: (e.target.value as "Available" | "Reserved" | "Sold") || undefined,
            })
          }
        />

        <Select
          label="سنة التسليم"
          options={yearOptions}
          value={filters.deliveryYear?.toString() || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              deliveryYear: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
        />
      </div>
    </div>
  );
}

