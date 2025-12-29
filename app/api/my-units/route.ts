import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { getContactById, getUnitById } from "@/lib/mock-data";

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

    const contact = getContactById(user.id);

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    const ownedUnits = contact.ownedUnits
      .map((unitId) => getUnitById(unitId))
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: ownedUnits,
    });
  } catch (error) {
    console.error("Error fetching owned units:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ" },
      { status: 500 }
    );
  }
}

