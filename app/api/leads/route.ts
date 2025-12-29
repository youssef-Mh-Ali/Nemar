import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/mock-data";
import { z } from "zod";

const leadSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName: z.string().min(2, "اسم العائلة مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(9, "رقم الهاتف غير صحيح"),
  interestedProjectId: z.string().optional(),
  interestedPhaseId: z.string().optional(),
  interestedUnitId: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = leadSchema.parse(body);

    const lead = createLead({
      ...validated,
      source: "PWA",
    });

    return NextResponse.json({
      success: true,
      data: lead,
      message: "تم تسجيل اهتمامك بنجاح. سنتواصل معك قريباً.",
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

    console.error("Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ. يرجى المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}

