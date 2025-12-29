import { NextRequest, NextResponse } from "next/server";
import { getUnitById, getRelatedUnits } from "@/lib/mock-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const unit = getUnitById(id);

    if (!unit) {
      return NextResponse.json(
        { success: false, error: "Unit not found" },
        { status: 404 }
      );
    }

    const relatedUnits = getRelatedUnits(id, 3);

    return NextResponse.json({
      success: true,
      data: {
        unit,
        relatedUnits,
      },
    });
  } catch (error) {
    console.error("Error fetching unit:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unit" },
      { status: 500 }
    );
  }
}

