import type { Project, Phase } from "../types";

export const mockPhases: Phase[] = [
  {
    id: "fc-phase-1",
    projectId: "future-city",
    name: "Phase 1 - Residential Villas",
    nameAr: "المرحلة الأولى - فلل سكنية",
    status: "Available",
    availableUnitsCount: 45,
  },
  {
    id: "fc-phase-2",
    projectId: "future-city",
    name: "Phase 2 - Commercial Zone",
    nameAr: "المرحلة الثانية - منطقة تجارية",
    status: "Available",
    availableUnitsCount: 12,
  },
  {
    id: "rg-phase-1",
    projectId: "riyadh-grove",
    name: "Phase 1 - Luxury Apartments",
    nameAr: "المرحلة الأولى - شقق فاخرة",
    status: "Available",
    availableUnitsCount: 30,
  },
  {
    id: "rg-phase-2",
    projectId: "riyadh-grove",
    name: "Phase 2 - Townhouses",
    nameAr: "المرحلة الثانية - تاون هاوس",
    status: "Available",
    availableUnitsCount: 20,
  }
];

export const mockProjects: Project[] = [
  {
    id: "future-city",
    name: "Future City",
    nameAr: "مدينة المستقبل",
    location: "North Riyadh",
    locationAr: "شمال الرياض",
    coverImageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: "Active",
    description: "Masterplan / Residential. A visionary urban development offering a blend of modern villas and vibrant commercial spaces designed for the future.",
    descriptionAr: "مخطط رئيسي لحي المستقبل. تطوير حضري برؤية مستقبلية يقدم مزيجاً من الفلل الحديثة والمساحات التجارية النابضة بالحياة.",
    phases: mockPhases.filter((p) => p.projectId === "future-city"),
  },
  {
    id: "riyadh-grove",
    name: "Riyadh Grove",
    nameAr: "رياض غروف",
    location: "West Riyadh",
    locationAr: "غرب الرياض",
    coverImageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    featuredVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    status: "Active",
    description: "Lifestyle community. A place for comfortable living and special moments, featuring luxury apartments and premium townhouses immersed in nature.",
    descriptionAr: "مكان للحياة المريحة واللحظات المميزة. مجتمع يقدم شققاً فاخرة ومنازل تاون هاوس متميزة وسط الطبيعة الخلابة.",
    phases: mockPhases.filter((p) => p.projectId === "riyadh-grove"),
  }
];

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export function getPhasesByProjectId(projectId: string): Phase[] {
  return mockPhases.filter((p) => p.projectId === projectId);
}

export function getPhaseById(id: string): Phase | undefined {
  return mockPhases.find((p) => p.id === id);
}

export function getFeaturedProject(): Project {
  return mockProjects[0];
}

export function hasAvailablePhases(project: Project): boolean {
  return project.phases.some((phase) => phase.status === "Available");
}

export function getAvailablePhasesCount(project: Project): number {
  return project.phases.filter((phase) => phase.status === "Available").length;
}
