"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bed,
  Bath,
  Maximize,
  Calendar,
  MapPin,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button, Badge, StatusBadge, Card, SkeletonUnitCard } from "@/components/ui";
import { RegisterInterestModal } from "@/components/home";
import { UnitCard } from "@/components/search";
import { getUnit } from "@/lib/api-client";
import { useAuthStore } from "@/lib/store";
import { Unit } from "@/lib/types";

interface UnitDetailsProps {
  params: Promise<{ id: string }>;
}

export default function UnitDetailsPage({ params }: UnitDetailsProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [relatedUnits, setRelatedUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    async function loadUnit() {
      setIsLoading(true);
      try {
        const response = await getUnit(id);
        if (response.success && response.data) {
          setUnit(response.data.unit);
          setRelatedUnits(response.data.relatedUnits);
        }
      } catch (error) {
        console.error("Error loading unit:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUnit();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
    });
  };

  const nextImage = () => {
    if (unit) {
      setActiveImageIndex((prev) => (prev + 1) % unit.images.length);
    }
  };

  const prevImage = () => {
    if (unit) {
      setActiveImageIndex((prev) =>
        prev === 0 ? unit.images.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="skeleton h-64 md:h-96 rounded-[var(--radius-lg)] mb-6" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-1/3" />
            <div className="skeleton h-6 w-1/2" />
            <div className="skeleton h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">الوحدة غير موجودة</h2>
          <p className="text-[var(--color-text-muted)] mb-4">
            عذراً، لم نتمكن من العثور على هذه الوحدة
          </p>
          <Button variant="primary" onClick={() => router.push("/search")}>
            العودة للبحث
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Back Button */}
      <div className="sticky top-16 z-30 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-border-light)]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
          >
            <ArrowRight className="w-5 h-5" />
            <span>رجوع</span>
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-[var(--color-bg-alt)]">
              <Heart className="w-5 h-5 text-[var(--color-text-muted)]" />
            </button>
            <button className="p-2 rounded-full hover:bg-[var(--color-bg-alt)]">
              <Share2 className="w-5 h-5 text-[var(--color-text-muted)]" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative aspect-[16/10] md:aspect-[16/9] bg-[var(--color-primary-dark)]"
        >
          <Image
            src={unit.images[activeImageIndex]}
            alt={`Unit ${unit.unitNumber}`}
            fill
            className="object-cover"
            priority
          />
          {/* Gallery Controls */}
          {unit.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {unit.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === activeImageIndex
                        ? "bg-white"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <StatusBadge status={unit.status} />
          </div>
        </motion.div>

        {/* Content */}
        <div className="px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <Badge variant="default" className="mb-2">
                  {unit.unitNumber}
                </Badge>
                <h1 className="text-2xl font-bold text-[var(--color-primary)]">
                  {formatPrice(unit.price)}
                </h1>
              </div>
            </div>

            {/* Project & Location */}
            <div className="flex items-center gap-2 text-[var(--color-text-secondary)] mb-6">
              <MapPin className="w-4 h-4" />
              <span>
                {unit.projectNameAr} • {unit.phaseNameAr}
              </span>
            </div>

            {/* Specs Grid */}
            <Card className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                <div className="text-center">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-[var(--color-primary)]" />
                  <p className="text-sm text-[var(--color-text-muted)]">غرف النوم</p>
                  <p className="font-semibold">{unit.bedrooms}</p>
                </div>
                <div className="text-center">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-[var(--color-primary)]" />
                  <p className="text-sm text-[var(--color-text-muted)]">دورات المياه</p>
                  <p className="font-semibold">{unit.bathrooms}</p>
                </div>
                <div className="text-center">
                  <Maximize className="w-6 h-6 mx-auto mb-2 text-[var(--color-primary)]" />
                  <p className="text-sm text-[var(--color-text-muted)]">المساحة</p>
                  <p className="font-semibold">{unit.area} م²</p>
                </div>
                <div className="text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-[var(--color-primary)]" />
                  <p className="text-sm text-[var(--color-text-muted)]">التسليم</p>
                  <p className="font-semibold">{formatDate(unit.deliveryDate)}</p>
                </div>
              </div>
            </Card>

            {/* Description */}
            {unit.descriptionAr && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">الوصف</h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {unit.descriptionAr}
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-3 mb-8">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setIsRegisterModalOpen(true)}
                disabled={unit.status === "Sold"}
              >
                {unit.status === "Sold" ? "مباع" : "سجل اهتمامك"}
              </Button>
              {user && (
                <Link href="/community">
                  <Button variant="outline" size="lg" fullWidth>
                    فتح طلب دعم
                  </Button>
                </Link>
              )}
            </div>

            {/* Related Units */}
            {relatedUnits.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">وحدات مشابهة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedUnits.map((relatedUnit) => (
                    <UnitCard key={relatedUnit.id} unit={relatedUnit} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Register Interest Modal */}
      <RegisterInterestModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        projectId={unit.projectId}
        phaseId={unit.phaseId}
        unitId={unit.id}
        projectName={unit.projectNameAr}
      />
    </div>
  );
}

