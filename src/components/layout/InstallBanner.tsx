import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Info } from 'lucide-react'
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '16px',
          right: '16px',
          zIndex: 40
        }}
        className="md:bottom-4 md:left-auto md:right-4 md:max-w-sm"
      >
        <motion.div
          className="bg-[#1a365d] text-white rounded-lg p-4 shadow-lg flex items-start gap-3"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
        >
          {/* App Icon - small and simple */}
          <motion.div
            className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <img
              src="/appicon.png"
              alt="Bin Saedan App Icon"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <Info className="w-4 h-4 text-white/80 mt-0.5 flex-shrink-0" />
              <h3 className="font-semibold text-sm text-white">
                تجربة أفضل مع التطبيق
              </h3>
            </div>
            <p className="text-xs text-white/80 mb-3 leading-relaxed">
              قم بتثبيت تطبيق فيصل بن سعيدان للوصول السريع
            </p>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleInstall}
                disabled={isInstalling}
                className="px-3 py-1.5 bg-[#c9a227] text-[#0f1f3a] text-sm font-medium rounded-md hover:bg-[#d4b64a] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isInstalling ? (
                  <svg
                    className="animate-spin h-3.5 w-3.5"
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
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isInstalling ? "جاري التثبيت..." : "تثبيت"}</span>
              </motion.button>
              
              <motion.button
                onClick={dismissInstallBanner}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="إغلاق"
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

