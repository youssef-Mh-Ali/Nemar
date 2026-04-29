"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Building2, ArrowLeft } from "lucide-react";
import { Card, Badge, SkeletonCard } from "@/components/ui";
import { getProjects } from "@/lib/api-client";
import { Project } from "@/lib/types";

interface ProjectWithAvailability extends Project {
  hasAvailability: boolean;
  availablePhasesCount?: number;
}

export function ProjectsGrid() {
  const [projects, setProjects] = useState<ProjectWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await getProjects();
        if (response.success && response.data) {
          setProjects(
            response.data.filter(
              (project) =>
                project.hasAvailability || (project.availablePhasesCount ?? 0) > 0
            )
          );
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  return (
    <section id="latest-projects" className="py-16 px-4 md:px-6 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-[var(--color-accent)] text-sm font-medium mb-2">
              مشاريعنا
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-3">
              أحدث المشاريع
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
              استكشف مجموعتنا المتميزة من المشاريع السكنية في أفضل مواقع المملكة
            </p>
          </motion.div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/search?projectId=${project.id}`}>
                  <Card hoverable padding="none" className="overflow-hidden group">
                    {/* Image */}
                    <div className="relative h-48 md:h-56 overflow-hidden">
                      <Image
                        src={project.coverImageUrl}
                        alt={project.nameAr}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Availability Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={project.hasAvailability ? "available" : "sold"}
                        >
                          {project.hasAvailability
                            ? `${project.availablePhasesCount} مراحل متاحة`
                            : "مباع بالكامل"}
                        </Badge>
                      </div>
                      {/* Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                        {project.nameAr}
                      </h3>
                      <div className="flex items-center gap-1 text-[var(--color-text-muted)] text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{project.locationAr}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                          <Building2 className="w-4 h-4" />
                          <span>{project.phases.length} مراحل</span>
                        </div>
                        <span className="flex items-center gap-1 text-sm text-[var(--color-primary)] font-medium group-hover:gap-2 transition-all">
                          عرض الوحدات
                          <ArrowLeft className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-medium transition-colors"
          >
            عرض جميع الوحدات
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

