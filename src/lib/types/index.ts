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
  externalId?: string;
  price: number;
  finalPrice?: number;
  status: "Available" | "Reserved" | "Sold" | "Contracted" | "On-Hold" | "Blocked";
  bedrooms: number;
  bathrooms?: number;
  area: number;
  bua?: number;
  floor?: number;
  finishing?: string;
  usageType?: string;
  view?: string;
  hasGarden?: boolean;
  hasLand?: boolean;
  hasRoof?: boolean;
  hasOutdoor?: boolean;
  gardenArea?: number;
  landArea?: number;
  roofArea?: number;
  outdoorArea?: number;
  eligibleForSubsidies?: boolean;
  subsidies?: string;
  deliveryDate?: string;
  images: string[];
  unitImage?: string;
  floorPlan?: string;
  sketchupEmbedUrl?: string;
  amenities?: string[];
  description?: string;
  descriptionAr?: string;
  projectName?: string;
  projectNameAr?: string;
  phaseName?: string;
  phaseNameAr?: string;
  buildingName?: string;
  blockName?: string;
  notes?: any[];
  paymentProgress?: number; // 0-100
  paymentStatus?: string;
}

export interface Lead {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profile?: "Investor" | "Supplier" | "Operator";
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
  buildingId?: string;
  blockId?: string;
  projectName?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minTotalArea?: number;
  maxTotalArea?: number;
  minBUA?: number;
  maxBUA?: number;
  status?: Unit["status"];
  usageType?: string;
  finishing?: string;
  city?: string;
  province?: string;
  hasGarden?: boolean;
  hasLand?: boolean;
  hasRoof?: boolean;
  hasOutdoor?: boolean;
  eligibleForSubsidies?: boolean;
  searchText?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
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

