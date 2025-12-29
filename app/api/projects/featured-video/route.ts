import { NextResponse } from "next/server";
import { getFeaturedProject } from "@/lib/mock-data";

export async function GET() {
  try {
    const featuredProject = getFeaturedProject();

    return NextResponse.json({
      success: true,
      data: {
        projectId: featuredProject.id,
        projectName: featuredProject.name,
        projectNameAr: featuredProject.nameAr,
        videoUrl: featuredProject.featuredVideoUrl,
        coverImageUrl: featuredProject.coverImageUrl,
      },
    });
  } catch (error) {
    console.error("Error fetching featured video:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch featured video" },
      { status: 500 }
    );
  }
}

