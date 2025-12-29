import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { getCasesByContactId, createCase } from "@/lib/mock-data";
import { z } from "zod";

const createCaseSchema = z.object({
  unitId: z.string().optional(),
  subject: z.string().min(5, "الموضوع مطلوب"),
  category: z.enum(["Maintenance", "Inquiry", "Complaint", "Documentation", "Other"]),
  description: z.string().min(10, "الوصف مطلوب"),
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth-token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "جلسة منتهية الصلاحية" },
        { status: 401 }
      );
    }

    const cases = getCasesByContactId(user.id);

    return NextResponse.json({
      success: true,
      data: cases,
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth-token")?.value;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "جلسة منتهية الصلاحية" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createCaseSchema.parse(body);

    const newCase = createCase(
      user.id,
      validated.unitId,
      validated.subject,
      validated.category,
      validated.description
    );

    return NextResponse.json({
      success: true,
      data: newCase,
      message: "تم إنشاء الطلب بنجاح",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "بيانات غير صحيحة",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Error creating case:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ" },
      { status: 500 }
    );
  }
}

