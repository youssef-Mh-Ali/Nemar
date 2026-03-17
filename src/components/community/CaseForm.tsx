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
  MenuItem,
} from '@mui/material'
import { Close, CheckCircle } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { createCase } from '../../lib/api-client'
import { useAuthStore } from '../../lib/store'
import { Unit } from '../../lib/types'

interface CaseFormProps {
  isOpen: boolean
  onClose: () => void
  units: Unit[]
  onSuccess: () => void
}

export default function CaseForm({ isOpen, onClose, units, onSuccess }: CaseFormProps) {
  const { t, i18n } = useTranslation()
  const { token } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schema = z.object({
    unitId: z.string().optional(),
    subject: z.string().min(5, t('cases.form.validation.subjectRequired')),
    category: z.enum(['Maintenance', 'Inquiry', 'Complaint', 'Documentation', 'Other']),
    description: z.string().min(10, t('cases.form.validation.descriptionRequired')),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'Inquiry',
    },
  })

  const categoryOptions = [
    { value: 'Maintenance', label: t('cases.category.maintenance') },
    { value: 'Inquiry', label: t('cases.category.inquiry') },
    { value: 'Complaint', label: t('cases.category.complaint') },
    { value: 'Documentation', label: t('cases.category.documentation') },
    { value: 'Other', label: t('cases.category.other') },
  ]

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await createCase(
        {
          unitId: data.unitId || undefined,
          subject: data.subject,
          category: data.category,
          description: data.description,
        },
        token || undefined
      )

      if (response.success) {
        setIsSuccess(true)
        reset()
        setTimeout(() => {
          onSuccess()
          onClose()
          setIsSuccess(false)
        }, 1500)
      } else {
        setError(response.error || t('cases.form.error'))
      }
    } catch {
      setError(t('cases.form.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setError(null)
      setIsSuccess(false)
      reset()
    }
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">{t('cases.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('cases.subtitle')}
            </Typography>
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
              {t('cases.form.successTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('cases.form.successMessage')}
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {units.length > 0 && (
                <TextField
                  {...register('unitId')}
                  select
                  label={t('cases.form.unit')}
                  fullWidth
                  error={!!errors.unitId}
                  helperText={errors.unitId?.message}
                >
                  <MenuItem value="">{t('cases.form.chooseUnit')}</MenuItem>
                  {units.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.unitNumber} - {i18n.language === 'ar' ? u.projectNameAr : u.projectName}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <TextField
                {...register('category')}
                select
                label={t('cases.form.type')}
                fullWidth
                error={!!errors.category}
                helperText={errors.category?.message}
              >
                {categoryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                {...register('subject')}
                label={t('cases.form.subject')}
                placeholder={t('cases.form.subjectPlaceholder')}
                fullWidth
                error={!!errors.subject}
                helperText={errors.subject?.message}
              />

              <TextField
                {...register('description')}
                label={t('cases.form.details')}
                placeholder={t('cases.form.detailsPlaceholder')}
                fullWidth
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description?.message}
              />

              {error && (
                <Alert severity="error">{error}</Alert>
              )}
            </Box>

            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button onClick={handleClose} disabled={isSubmitting}>
                {t('cases.form.cancel')}
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? t('cases.form.submitting') : t('cases.form.submit')}
              </Button>
            </DialogActions>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

