"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { login } from "@/lib/api-client";
import { useAuthStore } from "@/lib/store";

const schema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, setLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);

    try {
      const response = await login(data.username, data.password);

      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        router.push("/community");
      } else {
        setError(response.error || "حدث خطأ في تسجيل الدخول");
      }
    } catch {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--color-bg)] flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          <ArrowRight className="w-5 h-5" />
          العودة للرئيسية
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/BinSaedanLogo.png"
              alt="فيصل بن سعيدان"
              width={200}
              height={60}
              className="h-14 w-auto mx-auto mb-4"
              priority
            />
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              تسجيل الدخول
            </h1>
            <p className="text-[var(--color-text-muted)] mt-2">
              ادخل إلى حسابك للوصول لمجتمعك
            </p>
          </div>

          {/* Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="اسم المستخدم"
                placeholder="أدخل اسم المستخدم"
                error={errors.username?.message}
                {...register("username")}
              />

              <div className="relative">
                <Input
                  label="كلمة المرور"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-[38px] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {error && (
                <p className="text-sm text-[var(--color-error)] text-center bg-[var(--color-sold-bg)] p-3 rounded-[var(--radius-md)]">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
              >
                تسجيل الدخول
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-[var(--color-border-light)]">
              <p className="text-sm text-center text-[var(--color-text-muted)] mb-2">
                للتجربة، استخدم البيانات التالية:
              </p>
              <div className="bg-[var(--color-bg-alt)] rounded-[var(--radius-md)] p-3 text-sm">
                <p className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">اسم المستخدم:</span>
                  <code className="text-[var(--color-primary)]">demo</code>
                </p>
                <p className="flex justify-between mt-1">
                  <span className="text-[var(--color-text-muted)]">كلمة المرور:</span>
                  <code className="text-[var(--color-primary)]">demo123</code>
                </p>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            ليس لديك حساب؟{" "}
            <Link
              href="/contact"
              className="text-[var(--color-primary)] hover:underline"
            >
              تواصل معنا
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
