import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

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

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ" },
      { status: 500 }
    );
  }
}

