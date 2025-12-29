import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Grid,
} from '@mui/material'
import { Close, CheckCircle } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { createLead } from '../../lib/api-client'
import { useToastStore } from '../../lib/store/toast-store'

type FormData = z.infer<ReturnType<typeof getSchema>>

const getSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(2, t('registerInterest.firstNameRequired')),
  lastName: z.string().min(2, t('registerInterest.lastNameRequired')),
  email: z.string().email(t('registerInterest.emailInvalid')),
  phone: z.string().min(9, t('registerInterest.phoneInvalid')),
  message: z.string().optional(),
})

interface RegisterInterestModalProps {
  isOpen: boolean
  onClose: () => void
  projectId?: string
  phaseId?: string
  unitId?: string
  projectName?: string
}

export default function RegisterInterestModal({
  isOpen,
  onClose,
  projectId,
  phaseId,
  unitId,
  projectName,
}: RegisterInterestModalProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToastStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(getSchema(t)),
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await createLead({
        ...data,
        interestedProjectId: projectId,
        interestedPhaseId: phaseId,
        interestedUnitId: unitId,
      })

      if (response.success) {
        setIsSuccess(true)
        addToast(t('registerInterest.successMessage'), 'success')
        reset()
        setTimeout(() => {
          onClose()
          setIsSuccess(false)
        }, 2000)
      } else {
        const errorMsg = response.error || t('registerInterest.errorOccurred')
        setError(errorMsg)
        addToast(errorMsg, 'error')
      }
    } catch {
      setError(t('registerInterest.errorOccurred'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setError(null)
      setIsSuccess(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">{t('registerInterest.title')}</Typography>
            {projectName && (
              <Typography variant="body2" color="text.secondary">
                {projectName}
              </Typography>
            )}
          </Box>
          <Button onClick={handleClose} disabled={isSubmitting} sx={{ minWidth: 'auto', p: 1 }}>
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isSuccess ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('registerInterest.success')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('registerInterest.successMessage')}
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register('firstName')}
                  label={t('registerInterest.firstName')}
                  placeholder={t('registerInterest.firstNamePlaceholder')}
                  fullWidth
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  {...register('lastName')}
                  label={t('registerInterest.lastName')}
                  placeholder={t('registerInterest.lastNamePlaceholder')}
                  fullWidth
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register('email')}
                  label={t('registerInterest.email')}
                  type="email"
                  placeholder={t('registerInterest.emailPlaceholder')}
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register('phone')}
                  label={t('registerInterest.phone')}
                  type="tel"
                  placeholder={t('registerInterest.phonePlaceholder')}
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  {...register('message')}
                  label={t('registerInterest.notes')}
                  placeholder={t('registerInterest.notesPlaceholder')}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button onClick={handleClose} disabled={isSubmitting}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? t('registerInterest.submitting') : t('common.submit')}
              </Button>
            </DialogActions>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

