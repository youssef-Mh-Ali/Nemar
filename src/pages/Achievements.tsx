import { Award, Building2, Users, Trophy, ShieldCheck, Sparkles, Star, Quote, Home } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useCountUp } from "../hooks/useCountUp";
import { useReveal } from "../hooks/useReveal";

const Stat = ({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) => {
  const ref = useCountUp(value);
  return (
    <div className="reveal text-center">
      <div
        className="text-5xl font-bold text-primary md:text-6xl"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.01em" }}
      >
        <span ref={ref}>0</span>
        <span
          className="relative -top-2 ml-0.5 text-3xl font-medium md:-top-3 md:text-4xl"
          style={{ color: "hsl(var(--accent))" }}
        >
          {suffix}
        </span>
      </div>
      <div className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
};

const Achievements = () => {
  const { t, lang } = useLanguage();
  const ref = useReveal();

  const snapshotCards = [
    { icon: Home, title: t("ach.snapshot.cards.residential.title"), desc: t("ach.snapshot.cards.residential.desc") },
    { icon: Building2, title: t("ach.snapshot.cards.commercial.title"), desc: t("ach.snapshot.cards.commercial.desc") },
    { icon: Trophy, title: t("ach.snapshot.cards.investment.title"), desc: t("ach.snapshot.cards.investment.desc") },
    { icon: Users, title: t("ach.snapshot.cards.management.title"), desc: t("ach.snapshot.cards.management.desc") },
  ];

  const highlights = [
    { icon: Sparkles, title: t("ach.snapshot.highlights.legacy.title"), desc: t("ach.snapshot.highlights.legacy.desc") },
    { icon: ShieldCheck, title: t("ach.snapshot.highlights.quality.title"), desc: t("ach.snapshot.highlights.quality.desc") },
    { icon: Award, title: t("ach.snapshot.highlights.vision.title"), desc: t("ach.snapshot.highlights.vision.desc") },
  ];

  const isAr = lang.startsWith("ar");

  const awards = [
    { icon: Trophy, title: isAr ? "أفضل مطور عقاري" : "Best Real Estate Developer", desc: isAr ? "جائزة العقارات السعودية 2023" : "Saudi Real Estate Awards 2023" },
    { icon: ShieldCheck, title: isAr ? "شهادة ISO 9001" : "ISO 9001 Certified", desc: isAr ? "نظام إدارة الجودة" : "Quality Management Systems" },
    { icon: Award, title: isAr ? "هيئة السوق المالية" : "CMA Approved", desc: isAr ? "شريك معتمد لإدارة الصناديق العقارية" : "Approved real estate fund partner" },
    { icon: Sparkles, title: isAr ? "التميز في التصميم" : "Design Excellence", desc: isAr ? "جائزة العمارة الخليجية 2022" : "Gulf Architecture Award 2022" },
    { icon: Building2, title: isAr ? "الاستدامة الحضرية" : "Urban Sustainability", desc: isAr ? "تقدير رؤية 2030" : "Vision 2030 Recognition" },
    { icon: Users, title: isAr ? "خيار العملاء" : "Customer Choice", desc: isAr ? "5 سنوات متتالية" : "5 consecutive years" },
  ];

  const press = [
    { quote: isAr ? "أحد أبرز المطورين في المملكة، يجمع بين الجودة والابتكار." : "One of the Kingdom's most distinguished developers, blending quality with innovation.", source: "Arab News" },
    { quote: isAr ? "مرجع في بناء المجتمعات السكنية المتكاملة." : "A benchmark for building integrated residential communities.", source: "Saudi Gazette" },
    { quote: isAr ? "التزامهم بمعايير الاستدامة يضع معيارًا جديدًا." : "Their commitment to sustainability sets a new standard.", source: "Argaam" },
  ];

  return (
    <div ref={ref}>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-navy py-24 text-white">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="container-fbs relative text-center">
          <span className="reveal inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
            {isAr ? "إنجازاتنا" : "Our Achievements"}
          </span>
          <h1 className="reveal reveal-delay-1 mt-5 font-display text-5xl font-bold text-white md:text-6xl">
            {t("ach.title")}
          </h1>
          <p className="reveal reveal-delay-2 mx-auto mt-4 max-w-2xl text-lg text-white/80">{t("ach.subtitle")}</p>
        </div>
      </section>

      {/* COUNTERS */}
      <section className="container-fbs -mt-12 pb-16">
        <div className="rounded-2xl bg-white p-12 shadow-[0_20px_50px_-20px_rgba(2,6,23,0.25)] ring-1 ring-black/5 md:p-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <Stat value={35} suffix="+" label={t("ach.stats.years")} />
            <div className="hidden md:block" style={{ width: 0 }} />
            <Stat value={120} suffix="+" label={t("ach.stats.projects")} />
            <Stat value={30000} suffix="+" label={t("ach.stats.units")} />
            <Stat value={25000} suffix="+" label={t("ach.stats.families")} />
          </div>
        </div>
      </section>

      {/* COMPANY SNAPSHOT */}
      <section className="container-fbs py-20">
        <div className="text-center">
          <span className="reveal eyebrow">{t("ach.snapshot.kicker")}</span>
          <h2 className="reveal reveal-delay-1 mt-4 font-display text-4xl font-bold md:text-5xl">{t("ach.snapshot.title")}</h2>
          <p className="reveal reveal-delay-2 mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("ach.snapshot.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {snapshotCards.map((c, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${(i % 4) + 1} group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-accent hover:shadow-elegant`}
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/5 transition-all duration-700 group-hover:scale-150 group-hover:bg-accent/10" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {highlights.map((h, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1} rounded-2xl border bg-card p-8 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <h.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-semibold">{h.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AWARDS */}
      <section className="bg-secondary/40 py-20">
        <div className="container-fbs">
          <div className="text-center">
            <span className="reveal eyebrow">{t("ach.awards.title")}</span>
            <h2 className="reveal reveal-delay-1 mt-4 font-display text-4xl font-bold md:text-5xl">
              {t("ach.awards.subtitle")}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {awards.map((a, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${(i % 4) + 1} group relative overflow-hidden rounded-2xl border bg-card p-8 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-accent hover:shadow-elegant`}
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/5 transition-all duration-700 group-hover:scale-150 group-hover:bg-accent/10" />
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
                    <a.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">{a.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESS */}
      <section className="container-fbs py-20">
        <h2 className="reveal text-center font-display text-3xl font-bold md:text-4xl">{t("ach.press.title")}</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {press.map((p, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1} relative rounded-2xl border bg-card p-8 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant`}
            >
              <Quote className="h-8 w-8 text-accent/40" />
              <p className="mt-4 text-base leading-relaxed">{p.quote}</p>
              <div className="mt-6 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <div className="mt-3 text-sm font-semibold text-muted-foreground">— {p.source}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Achievements;
