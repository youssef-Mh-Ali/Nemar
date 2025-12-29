import { NextRequest, NextResponse } from "next/server";
import { searchUnits, mockUnits } from "@/lib/mock-data";
import { UnitFilters } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: UnitFilters = {};

    const projectId = searchParams.get("projectId");
    const phaseId = searchParams.get("phaseId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const minArea = searchParams.get("minArea");
    const maxArea = searchParams.get("maxArea");
    const status = searchParams.get("status");
    const deliveryYear = searchParams.get("deliveryYear");

    if (projectId) filters.projectId = projectId;
    if (phaseId) filters.phaseId = phaseId;
    if (minPrice) filters.minPrice = parseInt(minPrice);
    if (maxPrice) filters.maxPrice = parseInt(maxPrice);
    if (bedrooms) filters.bedrooms = parseInt(bedrooms);
    if (minArea) filters.minArea = parseInt(minArea);
    if (maxArea) filters.maxArea = parseInt(maxArea);
    if (status) filters.status = status as UnitFilters["status"];
    if (deliveryYear) filters.deliveryYear = parseInt(deliveryYear);

    const hasFilters = Object.keys(filters).length > 0;
    const units = hasFilters ? searchUnits(filters) : mockUnits;

    return NextResponse.json({
      success: true,
      data: units,
      meta: {
        total: units.length,
        filters: filters,
      },
    });
  } catch (error) {
    console.error("Error searching units:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search units" },
      { status: 500 }
    );
  }
}

