"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const {
    installPromptEvent,
    isInstallable,
    showInstallBanner,
    setInstallPrompt,
    dismissInstallBanner,
  } = useAppStore();
  
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [setInstallPrompt]);

  const handleInstall = async () => {
    if (!installPromptEvent) return;

    setIsInstalling(true);
    await installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setIsInstalling(false);
    setInstallPrompt(null);
  };

  if (isInstalled || !isInstallable || !showInstallBanner) {
    return null;
  }

  // Animation variants
  const containerVariants = {
    hidden: { 
      y: 100, 
      opacity: 0, 
      scale: 0.9 
    },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { 
      y: 100, 
      opacity: 0, 
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const iconVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    pulse: {
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:max-w-sm z-40"
      >
        {/* Main container with glassmorphism and gradient */}
        <motion.div
          className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary)] to-[var(--color-primary-dark)] shadow-2xl border border-white/10"
          style={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)"
          }}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 via-transparent to-[var(--color-primary-dark)]/50 pointer-events-none" />
          
          {/* Animated sparkle effect */}
          <motion.div
            className="absolute top-2 left-2 opacity-30"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
          </motion.div>

          {/* Close button */}
          <motion.button
            onClick={dismissInstallBanner}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            aria-label="إغلاق"
          >
            <X className="w-4 h-4 text-white" />
          </motion.button>
          
          {/* Content */}
          <div className="relative p-5">
            <div className="flex items-start gap-4">
              {/* App Icon with animated container */}
              <motion.div
                className="relative flex-shrink-0"
                variants={itemVariants}
              >
                {/* Glow effect behind icon */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-[var(--color-accent)]/30 blur-xl"
                  variants={glowVariants}
                  animate="pulse"
                />
                
                {/* Icon container */}
                <motion.div
                  className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-lg"
                  variants={iconVariants}
                  animate="pulse"
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src="/appicon.png"
                    alt="Bin Saedan App Icon"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </motion.div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pt-1">
                <motion.h3
                  variants={itemVariants}
                  className="font-bold text-base mb-1.5 text-white leading-tight"
                >
                  تجربة أفضل مع التطبيق
                </motion.h3>
                <motion.p
                  variants={itemVariants}
                  className="text-sm text-white/90 mb-4 leading-relaxed"
                >
                  قم بتثبيت تطبيق فيصل بن سعيدان للوصول السريع والإشعارات
                </motion.p>
                
                {/* Install button */}
                <motion.div variants={itemVariants}>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={handleInstall}
                    disabled={isInstalling}
                    isLoading={isInstalling}
                    className="w-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden group"
                  >
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ x: 0 }}
                      animate={isInstalling ? { x: [0, -2, 0] } : {}}
                      transition={{ duration: 0.5, repeat: isInstalling ? Infinity : 0 }}
                    >
                      <Download className="w-4 h-4" />
                      <span>{isInstalling ? "جاري التثبيت..." : "تثبيت التطبيق"}</span>
                    </motion.div>
                    
                    {/* Button shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut"
                      }}
                    />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent-light)] to-[var(--color-accent)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

