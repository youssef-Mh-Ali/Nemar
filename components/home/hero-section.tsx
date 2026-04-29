"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { getFeaturedVideo } from "@/lib/api-client";
import Link from "next/link";

interface FeaturedVideo {
  projectId: string;
  projectName: string;
  projectNameAr: string;
  videoUrl: string;
  coverImageUrl: string;
}

export function HeroSection() {
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideo | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedVideo() {
      try {
        const response = await getFeaturedVideo();
        if (response.success && response.data) {
          setFeaturedVideo(response.data);
        }
      } catch (error) {
        console.error("Error loading featured video:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeaturedVideo();
  }, []);

  const scrollToProjects = () => {
    document.getElementById("latest-projects")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {featuredVideo && !isVideoPlaying && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${featuredVideo.coverImageUrl})` }}
          />
        )}
        {isVideoPlaying && featuredVideo && (
          <iframe
            src={`${featuredVideo.videoUrl}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-dark)]/70 via-[var(--color-primary-dark)]/50 to-[var(--color-primary-dark)]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <Image
              src="/FBS%20logo%20acronim.svg"
              alt="فيصل بن سعيدان"
              width={280}
              height={80}
              className="h-16 md:h-20 w-auto mx-auto"
              priority
            />
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            مجتمعك
            <br />
            <span className="text-[var(--color-accent)]">بأسلوب جديد</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            اكتشف أرقى المشاريع السكنية في المملكة العربية السعودية.
            <br className="hidden md:block" />
            نبني مجتمعات متكاملة للأجيال القادمة.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/search">
              <Button variant="accent" size="lg" className="min-w-[200px]">
                استكشف المشاريع
              </Button>
            </Link>
            {!isVideoPlaying && featuredVideo && (
              <Button
                variant="outline"
                size="lg"
                className="min-w-[200px] border-white/30 text-white hover:bg-white/10"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="w-5 h-5" />
                شاهد الفيديو
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        onClick={scrollToProjects}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors"
        aria-label="انتقل للأسفل"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </motion.button>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-[var(--color-primary-dark)] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
}
