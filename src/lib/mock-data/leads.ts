import type { Lead } from "../types";

let leadsStore: Lead[] = [];

export function createLead(leadData: Omit<Lead, "id" | "createdAt">): Lead {
  const newLead: Lead = {
    ...leadData,
    id: `lead-${Date.now()}`,
    source: "PWA",
    createdAt: new Date().toISOString(),
  };
  leadsStore.push(newLead);
  console.log("Lead created:", newLead);
  return newLead;
}

export function getLeads(): Lead[] {
  return leadsStore;
}

export function getLeadById(id: string): Lead | undefined {
  return leadsStore.find((l) => l.id === id);
}

