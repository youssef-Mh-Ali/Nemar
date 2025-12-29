import { NextRequest, NextResponse } from "next/server";
import { getContactByUsername, validatePassword } from "@/lib/mock-data";
import { createToken } from "@/lib/auth/jwt";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    const contact = getContactByUsername(username);

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const isValid = await validatePassword(contact, password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const user = {
      id: contact.id,
      username: contact.username,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
    };

    const token = await createToken(user);

    const response = NextResponse.json({
      success: true,
      data: { user, token },
      message: "تم تسجيل الدخول بنجاح",
    });

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ. يرجى المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}

