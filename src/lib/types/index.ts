// Types matching future Salesforce objects

export interface Project {
  id: string;
  name: string;
  nameAr: string;
  location: string;
  locationAr: string;
  coverImageUrl: string;
  featuredVideoUrl: string;
  status: "Active" | "Completed";
  description?: string;
  descriptionAr?: string;
  phases: Phase[];
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  nameAr: string;
  status: "Available" | "SoldOut";
  availableUnitsCount: number;
}

export interface Unit {
  id: string;
  projectId: string;
  phaseId: string;
  unitNumber: string;
  price: number;
  bedrooms: number;
  bathrooms?: number;
  area: number;
  status: "Available" | "Reserved" | "Sold";
  deliveryDate: string;
  images: string[];
  floorPlan?: string;
  sketchupEmbedUrl?: string;
  amenities?: string[];
  description?: string;
  descriptionAr?: string;
  projectName?: string;
  projectNameAr?: string;
  phaseName?: string;
  phaseNameAr?: string;
}

export interface Lead {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: "PWA";
  interestedProjectId?: string;
  interestedPhaseId?: string;
  interestedUnitId?: string;
  message?: string;
  createdAt?: string;
}

export interface Contact {
  id: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ownedUnits: string[];
}

export interface Case {
  id: string;
  contactId: string;
  unitId?: string;
  subject: string;
  category: CaseCategory;
  description: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
}

export type CaseCategory =
  | "Maintenance"
  | "Inquiry"
  | "Complaint"
  | "Documentation"
  | "Other";

export type CaseStatus = "New" | "InProgress" | "Resolved" | "Closed";

export interface UnitFilters {
  projectId?: string;
  phaseId?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  minArea?: number;
  maxArea?: number;
  status?: Unit["status"];
  deliveryYear?: number;
}

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

