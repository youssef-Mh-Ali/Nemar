"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { HeroSection, ProjectsGrid, RegisterInterestModal } from "@/components/home";
import { Button } from "@/components/ui";

export default function HomePage() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <>
      <HeroSection />
      <ProjectsGrid />

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 md:px-6 bg-[var(--color-bg-alt)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block text-[var(--color-accent)] text-sm font-medium mb-2">
              لماذا نحن
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-3">
              إرث من الثقة والجودة
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
              نبني مجتمعات متكاملة منذ أكثر من ثلاثة عقود
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "جودة البناء",
                description:
                  "نلتزم بأعلى معايير الجودة في البناء والتشطيب",
                icon: "🏗️",
              },
              {
                title: "مواقع استراتيجية",
                description:
                  "نختار أفضل المواقع لضمان استثمار مستقبلي ناجح",
                icon: "📍",
              },
              {
                title: "خدمة ما بعد البيع",
                description:
                  "نقدم خدمات متكاملة لعملائنا حتى بعد التسليم",
                icon: "🤝",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                  {item.title}
                </h3>
                <p className="text-[var(--color-text-muted)]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 bg-[var(--color-primary)]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              هل تبحث عن منزل أحلامك؟
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              سجل اهتمامك الآن وسيتواصل معك فريقنا لمساعدتك في اختيار الوحدة
              المناسبة
            </p>
            <Button
              variant="accent"
              size="lg"
              onClick={() => setIsRegisterModalOpen(true)}
            >
              سجل اهتمامك الآن
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 px-4 md:px-6 bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8">
            <a
              href="tel:+966112345678"
              className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span dir="ltr">+966 11 234 5678</span>
            </a>
            <a
              href="mailto:info@binsaedan.com"
              className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>info@binsaedan.com</span>
            </a>
            <span className="flex items-center gap-3 text-[var(--color-text-secondary)]">
              <MapPin className="w-5 h-5" />
              <span>الرياض، المملكة العربية السعودية</span>
            </span>
          </div>
        </div>
      </section>

      {/* Register Interest Modal */}
      <RegisterInterestModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </>
  );
}

