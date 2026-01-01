import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Sparkles } from 'lucide-react'
import { useAppStore } from '../../lib/store'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner() {
  const { installPromptEvent, isInstallable, showInstallBanner, setInstallPrompt, dismissInstallBanner } =
    useAppStore()
  const [isInstalled, setIsInstalled] = useState(() => 
    typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
  )
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    if (isInstalled) return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled, setInstallPrompt])

  const handleInstall = async () => {
    if (!installPromptEvent) return

    setIsInstalling(true)
    await installPromptEvent.prompt()
    const { outcome } = await installPromptEvent.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setIsInstalling(false)
    setInstallPrompt(null)
  }

  if (isInstalled || !isInstallable || !showInstallBanner) {
    return null
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
        type: "spring" as const,
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
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    }
  }

  const iconVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  }

  const glowVariants = {
    pulse: {
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '16px',
          right: '16px',
          zIndex: 40
        }}
        className="md:bottom-4 md:left-auto md:right-4 md:max-w-sm"
      >
        {/* Main container with glassmorphism and gradient */}
        <motion.div
          className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-[#1a365d] via-[#1a365d] to-[#0f1f3a] shadow-2xl border border-white/10"
          style={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)"
          }}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#c9a227]/10 via-transparent to-[#0f1f3a]/50 pointer-events-none" />
          
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
            <Sparkles className="w-4 h-4 text-[#c9a227]" />
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
                  className="absolute inset-0 rounded-2xl bg-[#c9a227]/30 blur-xl"
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
                  <motion.button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="w-full px-4 py-2.5 bg-[#c9a227] text-[#0f1f3a] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden group flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ x: 0 }}
                      animate={isInstalling ? { x: [0, -2, 0] } : {}}
                      transition={{ duration: 0.5, repeat: isInstalling ? Infinity : 0 }}
                    >
                      {isInstalling ? (
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
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
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c9a227] via-[#d4b64a] to-[#c9a227]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

