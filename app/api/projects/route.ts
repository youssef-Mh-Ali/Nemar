import { NextResponse } from "next/server";
import { mockProjects, hasAvailablePhases } from "@/lib/mock-data";

export async function GET() {
  try {
    const projectsWithAvailability = mockProjects.map((project) => ({
      ...project,
      hasAvailability: hasAvailablePhases(project),
      availablePhasesCount: project.phases.filter(
        (p) => p.status === "Available"
      ).length,
    }));

    return NextResponse.json({
      success: true,
      data: projectsWithAvailability,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

