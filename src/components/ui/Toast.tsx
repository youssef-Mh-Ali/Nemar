import { Box, Snackbar, Alert, IconButton } from '@mui/material'
import { Close, CheckCircle, ErrorOutline, Info, WarningAmber } from '@mui/icons-material'
import { useToastStore, ToastType } from '../../lib/store/toast-store'
import { motion, AnimatePresence } from 'framer-motion'

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: ErrorOutline,
  info: Info,
  warning: WarningAmber,
}

const colors: Record<ToastType, 'success' | 'error' | 'info' | 'warning'> = {
  success: 'success',
  error: 'error',
  info: 'info',
  warning: 'warning',
}

export default function Toast() {
  const { toasts, removeToast } = useToastStore()

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: '400px',
        width: '100%',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity={colors[toast.type]}
                icon={<Icon sx={{ fontSize: 20 }} />}
                action={
                  <IconButton
                    size="small"
                    onClick={() => removeToast(toast.id)}
                    sx={{ color: 'inherit' }}
                  >
                    <Close sx={{ fontSize: 16 }} />
                  </IconButton>
                }
                sx={{
                  boxShadow: 3,
                  '& .MuiAlert-icon': {
                    alignItems: 'center',
                  },
                }}
              >
                {toast.message}
              </Alert>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </Box>
  )
}

