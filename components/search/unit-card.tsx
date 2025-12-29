"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bed, Bath, Maximize, Calendar } from "lucide-react";
import { Card, StatusBadge } from "@/components/ui";
import { Unit } from "@/lib/types";

interface UnitCardProps {
  unit: Unit;
  index?: number;
}

export function UnitCard({ unit, index = 0 }: UnitCardProps) {
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
      month: "short",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/unit/${unit.id}`}>
        <Card hoverable padding="none" className="overflow-hidden group">
          {/* Image */}
          <div className="relative h-44 md:h-48 overflow-hidden">
            <Image
              src={unit.images[0] || "/placeholder.jpg"}
              alt={`Unit ${unit.unitNumber}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <StatusBadge status={unit.status} />
            </div>
            {/* Unit Number */}
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {unit.unitNumber}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Price */}
            <div className="text-lg font-bold text-[var(--color-primary)] mb-2">
              {formatPrice(unit.price)}
            </div>

            {/* Project/Phase */}
            <p className="text-sm text-[var(--color-text-secondary)] mb-3 line-clamp-1">
              {unit.projectNameAr} • {unit.phaseNameAr}
            </p>

            {/* Specs */}
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                {unit.bedrooms} غرف
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                {unit.bathrooms}
              </span>
              <span className="flex items-center gap-1">
                <Maximize className="w-4 h-4" />
                {unit.area} م²
              </span>
            </div>

            {/* Delivery */}
            <div className="mt-3 pt-3 border-t border-[var(--color-border-light)] flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <Calendar className="w-4 h-4" />
              <span>التسليم: {formatDate(unit.deliveryDate)}</span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

