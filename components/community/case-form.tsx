"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { createCase } from "@/lib/api-client";
import { useAuthStore } from "@/lib/store";
import { Unit } from "@/lib/types";

const schema = z.object({
  unitId: z.string().optional(),
  subject: z.string().min(5, "الموضوع مطلوب (5 أحرف على الأقل)"),
  category: z.enum(["Maintenance", "Inquiry", "Complaint", "Documentation", "Other"]),
  description: z.string().min(10, "الوصف مطلوب (10 أحرف على الأقل)"),
});

type FormData = z.infer<typeof schema>;

const categoryOptions = [
  { value: "Maintenance", label: "صيانة" },
  { value: "Inquiry", label: "استفسار" },
  { value: "Complaint", label: "شكوى" },
  { value: "Documentation", label: "مستندات" },
  { value: "Other", label: "أخرى" },
];

interface CaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  units: Unit[];
  onSuccess: () => void;
}

export function CaseForm({ isOpen, onClose, units, onSuccess }: CaseFormProps) {
  const { token } = useAuthStore();
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
    defaultValues: {
      category: "Inquiry",
    },
  });

  const unitOptions = [
    { value: "", label: "اختر وحدة (اختياري)" },
    ...units.map((u) => ({ value: u.id, label: `${u.unitNumber} - ${u.projectNameAr}` })),
  ];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createCase(
        {
          unitId: data.unitId || undefined,
          subject: data.subject,
          category: data.category,
          description: data.description,
        },
        token || undefined
      );

      if (response.success) {
        setIsSuccess(true);
        reset();
        setTimeout(() => {
          onSuccess();
          onClose();
          setIsSuccess(false);
        }, 1500);
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
      reset();
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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] overflow-hidden max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)] sticky top-0 bg-[var(--color-bg-card)]">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    فتح طلب جديد
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    سيتم الرد عليك في أقرب وقت
                  </p>
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
                      تم إنشاء الطلب بنجاح!
                    </h3>
                    <p className="text-[var(--color-text-muted)]">
                      سيتم التواصل معك قريباً
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {units.length > 0 && (
                      <Select
                        label="الوحدة المتعلقة"
                        options={unitOptions}
                        error={errors.unitId?.message}
                        {...register("unitId")}
                      />
                    )}

                    <Select
                      label="نوع الطلب"
                      options={categoryOptions}
                      error={errors.category?.message}
                      {...register("category")}
                    />

                    <Input
                      label="الموضوع"
                      placeholder="مثال: صيانة التكييف"
                      error={errors.subject?.message}
                      {...register("subject")}
                    />

                    <Textarea
                      label="التفاصيل"
                      placeholder="اشرح طلبك بالتفصيل..."
                      rows={4}
                      error={errors.description?.message}
                      {...register("description")}
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
                      إرسال الطلب
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

