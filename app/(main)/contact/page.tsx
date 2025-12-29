"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Instagram,
  Twitter,
} from "lucide-react";
import { Button, Input, Textarea, Card } from "@/components/ui";
import { createLead } from "@/lib/api-client";

const schema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName: z.string().min(2, "اسم العائلة مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(9, "رقم الهاتف غير صحيح"),
  message: z.string().min(10, "الرسالة مطلوبة"),
});

type FormData = z.infer<typeof schema>;

const contactInfo = [
  {
    icon: Phone,
    label: "الهاتف",
    value: "+966 11 234 5678",
    href: "tel:+966112345678",
  },
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    value: "info@binsaedan.com",
    href: "mailto:info@binsaedan.com",
  },
  {
    icon: MapPin,
    label: "العنوان",
    value: "الرياض، المملكة العربية السعودية",
  },
  {
    icon: Clock,
    label: "ساعات العمل",
    value: "الأحد - الخميس، 9 ص - 5 م",
  },
];

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/binsaedan", label: "تويتر" },
  { icon: Instagram, href: "https://instagram.com/binsaedan", label: "انستقرام" },
];

export default function ContactPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);

    try {
      const response = await createLead(data);

      if (response.success) {
        setIsSuccess(true);
        reset();
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        setError(response.error || "حدث خطأ. يرجى المحاولة مرة أخرى.");
      }
    } catch {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="bg-[var(--color-primary)] text-white px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-3">تواصل معنا</h1>
            <p className="text-white/80 max-w-xl mx-auto">
              نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو ملاحظات
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">أرسل لنا رسالة</h2>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <CheckCircle2 className="w-16 h-16 text-[var(--color-success)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                    تم إرسال رسالتك!
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

                  <Textarea
                    label="رسالتك"
                    placeholder="كيف يمكننا مساعدتك؟"
                    rows={4}
                    error={errors.message?.message}
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
                    <Send className="w-4 h-4" />
                    إرسال
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-semibold mb-4">معلومات التواصل</h2>
              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-3 p-4 bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] border border-[var(--color-border-light)]">
                      <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {item.label}
                        </p>
                        <p className="font-medium text-[var(--color-text)]">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h2 className="text-lg font-semibold mb-4">تابعنا</h2>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-[var(--color-bg-card)] border border-[var(--color-border-light)] rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-alt)] transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="aspect-video bg-[var(--color-bg-alt)] rounded-[var(--radius-lg)] flex items-center justify-center border border-[var(--color-border-light)]">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--color-text-muted)]">
                  الخريطة ستظهر هنا
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

