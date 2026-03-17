import type { Unit, UnitFilters } from "../types";

export const mockUnits: Unit[] = [
  // Future City - Phase 1 (Residential Villas)
  {
    id: "fc-unit-1",
    projectId: "future-city",
    phaseId: "fc-phase-1",
    unitNumber: "V-101",
    price: 3500000,
    bedrooms: 5,
    bathrooms: 6,
    area: 450,
    status: "Available",
    deliveryDate: "2026-12-01",
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
    ],
    floorPlan: "https://www.omranarch.com/m/images/projects/2008/0816-calfornia-compund/1.jpg",
    sketchupEmbedUrl: "https://3dwarehouse.sketchup.com/embed/2532d83b-9925-4731-b0e0-8bafba3d4a9f?token=L4tFhudHN9k=&binaryName=s21",
    amenities: [
      "Private Pool",
      "Smart Home System",
      "Maid's Room",
      "Driver's Room",
      "2-Car Garage",
      "Landscaped Garden"
    ],
    projectName: "Future City",
    projectNameAr: "مدينة المستقبل",
    phaseName: "Phase 1 - Residential Villas",
    phaseNameAr: "المرحلة الأولى - فلل سكنية",
    description: "Premium standalone villa with smart home automation and a private heated pool.",
    descriptionAr: "فيلا مستقلة فاخرة مع نظام ذكي ومسبح خاص مدفأ."
  },
  {
    id: "fc-unit-2",
    projectId: "future-city",
    phaseId: "fc-phase-1",
    unitNumber: "V-102",
    price: 2800000,
    bedrooms: 4,
    bathrooms: 5,
    area: 380,
    status: "Reserved",
    deliveryDate: "2026-12-01",
    images: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80"
    ],
    projectName: "Future City",
    projectNameAr: "مدينة المستقبل",
    phaseName: "Phase 1 - Residential Villas",
    phaseNameAr: "المرحلة الأولى - فلل سكنية",
  },

  // Future City - Phase 2 (Commercial Zone)
  {
    id: "fc-unit-3",
    projectId: "future-city",
    phaseId: "fc-phase-2",
    unitNumber: "CZ-01",
    price: 5500000,
    bedrooms: 0,
    bathrooms: 2,
    area: 250,
    status: "Available",
    deliveryDate: "2027-03-01",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"
    ],
    amenities: [
      "High Visibility",
      "Dedicated Parking",
      "24/7 Security",
      "High-speed Fiber Internet"
    ],
    projectName: "Future City",
    projectNameAr: "مدينة المستقبل",
    phaseName: "Phase 2 - Commercial Zone",
    phaseNameAr: "المرحلة الثانية - منطقة تجارية",
    description: "Spacious retail showroom unit in the heart of Future City's commercial hub.",
    descriptionAr: "معرض تجاري واسع في قلب المركز التجاري لمدينة المستقبل."
  },

  // Riyadh Grove - Phase 1 (Luxury Apartments)
  {
    id: "rg-unit-1",
    projectId: "riyadh-grove",
    phaseId: "rg-phase-1",
    unitNumber: "A-501",
    price: 1200000,
    bedrooms: 3,
    bathrooms: 3,
    area: 165,
    status: "Available",
    deliveryDate: "2025-08-01",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6c563afe60?w=800&q=80"
    ],
    amenities: [
      "Community Gym",
      "Swimming Pool",
      "Kids Play Area",
      "Underground Parking",
      "Balcony with Park View"
    ],
    projectName: "Riyadh Grove",
    projectNameAr: "رياض غروف",
    phaseName: "Phase 1 - Luxury Apartments",
    phaseNameAr: "المرحلة الأولى - شقق فاخرة",
    description: "Modern 3-bedroom apartment featuring open-plan living and scenic park views.",
    descriptionAr: "شقة حديثة بـ 3 غرف نوم تتميز بتصميم مفتوح وإطلالات خلابة على الحديقة."
  },
  {
    id: "rg-unit-2",
    projectId: "riyadh-grove",
    phaseId: "rg-phase-1",
    unitNumber: "A-502",
    price: 950000,
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    status: "Available",
    deliveryDate: "2025-08-01",
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80"
    ],
    projectName: "Riyadh Grove",
    projectNameAr: "رياض غروف",
    phaseName: "Phase 1 - Luxury Apartments",
    phaseNameAr: "المرحلة الأولى - شقق فاخرة"
  },

  // Riyadh Grove - Phase 2 (Townhouses)
  {
    id: "rg-unit-3",
    projectId: "riyadh-grove",
    phaseId: "rg-phase-2",
    unitNumber: "TH-15",
    price: 2100000,
    bedrooms: 4,
    bathrooms: 5,
    area: 280,
    status: "Available",
    deliveryDate: "2026-02-01",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80"
    ],
    amenities: [
      "Private Garden",
      "Rooftop Terrace",
      "Maid's Room",
      "Community Park Access",
      "Clubhouse Access"
    ],
    projectName: "Riyadh Grove",
    projectNameAr: "رياض غروف",
    phaseName: "Phase 2 - Townhouses",
    phaseNameAr: "المرحلة الثانية - تاون هاوس",
    description: "Spacious family townhouse with a private garden and rooftop terrace.",
    descriptionAr: "تاون هاوس عائلي واسع مع حديقة خاصة وتراس على السطح."
  }
];

export function getUnitById(id: string): Unit | undefined {
  return mockUnits.find((u) => u.id === id);
}

export function getUnitsByProjectId(projectId: string): Unit[] {
  return mockUnits.filter((u) => u.projectId === projectId);
}

export function getUnitsByPhaseId(phaseId: string): Unit[] {
  return mockUnits.filter((u) => u.phaseId === phaseId);
}

export function searchUnits(filters: UnitFilters): Unit[] {
  return mockUnits.filter((unit) => {
    if (filters.projectId && unit.projectId !== filters.projectId) return false;
    if (filters.phaseId && unit.phaseId !== filters.phaseId) return false;
    if (filters.minPrice && unit.price < filters.minPrice) return false;
    if (filters.maxPrice && unit.price > filters.maxPrice) return false;
    if (filters.bedrooms && unit.bedrooms !== filters.bedrooms) return false;
    if (filters.minArea && unit.area < filters.minArea) return false;
    if (filters.maxArea && unit.area > filters.maxArea) return false;
    if (filters.status && unit.status !== filters.status) return false;
    if (filters.deliveryYear) {
      const unitYear = new Date(unit.deliveryDate).getFullYear();
      if (unitYear !== filters.deliveryYear) return false;
    }
    return true;
  });
}

export function getAvailableUnitsCount(): number {
  return mockUnits.filter((u) => u.status === "Available").length;
}

export function getRelatedUnits(unitId: string, limit: number = 3): Unit[] {
  const unit = getUnitById(unitId);
  if (!unit) return [];

  return mockUnits
    .filter(
      (u) =>
        u.id !== unitId &&
        u.status === "Available" &&
        (u.projectId === unit.projectId || u.bedrooms === unit.bedrooms)
    )
    .slice(0, limit);
}
