"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { createLead } from "@/lib/api-client";

const schema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName: z.string().min(2, "اسم العائلة مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(9, "رقم الهاتف غير صحيح"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface RegisterInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  phaseId?: string;
  unitId?: string;
  projectName?: string;
}

export function RegisterInterestModal({
  isOpen,
  onClose,
  projectId,
  phaseId,
  unitId,
  projectName,
}: RegisterInterestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createLead({
        ...data,
        interestedProjectId: projectId,
        interestedPhaseId: phaseId,
        interestedUnitId: unitId,
      });

      if (response.success) {
        setIsSuccess(true);
        reset();
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
        }, 2000);
      } else {
        setError(response.error || "حدث خطأ. يرجى المحاولة مرة أخرى.");
      }
    } catch {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError(null);
      setIsSuccess(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)]">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    سجل اهتمامك
                  </h2>
                  {projectName && (
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {projectName}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-[var(--color-bg-alt)] transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center"
                  >
                    <CheckCircle2 className="w-16 h-16 text-[var(--color-success)] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                      تم التسجيل بنجاح!
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                      سنتواصل معك قريباً
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="الاسم الأول"
                        placeholder="أحمد"
                        error={errors.firstName?.message}
                        {...register("firstName")}
                      />
                      <Input
                        label="اسم العائلة"
                        placeholder="الراشد"
                        error={errors.lastName?.message}
                        {...register("lastName")}
                      />
                    </div>

                    <Input
                      label="البريد الإلكتروني"
                      type="email"
                      placeholder="ahmed@example.com"
                      error={errors.email?.message}
                      {...register("email")}
                    />

                    <Input
                      label="رقم الهاتف"
                      type="tel"
                      placeholder="+966 5X XXX XXXX"
                      error={errors.phone?.message}
                      {...register("phone")}
                    />

                    <Input
                      label="ملاحظات (اختياري)"
                      placeholder="أي استفسارات أو ملاحظات..."
                      {...register("message")}
                    />

                    {error && (
                      <p className="text-sm text-[var(--color-error)] text-center">
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
                      إرسال
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

