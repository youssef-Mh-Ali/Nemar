import { useEffect, useState } from 'react'
import { Snackbar, Alert, IconButton, Button, Box } from '@mui/material'
import { Close, Download } from '@mui/icons-material'
import { useAppStore } from '../../lib/store'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner() {
  const { installPromptEvent, isInstallable, showInstallBanner, setInstallPrompt, dismissInstallBanner } =
    useAppStore()
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

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
  }, [setInstallPrompt])

  const handleInstall = async () => {
    if (!installPromptEvent) return

    await installPromptEvent.prompt()
    const { outcome } = await installPromptEvent.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setInstallPrompt(null)
  }

  if (isInstalled || !isInstallable || !showInstallBanner) {
    return null
  }

  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: '80px', md: '20px' } }}
    >
      <Alert
        severity="info"
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              color="inherit"
              size="small"
              onClick={handleInstall}
              startIcon={<Download />}
              sx={{ color: 'white' }}
            >
              تثبيت
            </Button>
            <IconButton size="small" onClick={dismissInstallBanner} sx={{ color: 'white' }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          '& .MuiAlert-icon': { color: 'white' },
        }}
      >
        <Box sx={{ fontWeight: 500, mb: 0.5 }}>تجربة أفضل مع التطبيق</Box>
        <Box sx={{ fontSize: '0.875rem', opacity: 0.9 }}>
          قم بتثبيت تطبيق فيصل بن سعيدان للوصول السريع
        </Box>
      </Alert>
    </Snackbar>
  )
}

