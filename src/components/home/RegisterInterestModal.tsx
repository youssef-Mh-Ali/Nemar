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
import { createLead } from '../../lib/api-client'
import { useToastStore } from '../../lib/store/toast-store'

const schema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'اسم العائلة مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(9, 'رقم الهاتف غير صحيح'),
  message: z.string().optional(),
})

type FormData = z.infer<typeof schema>

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
    resolver: zodResolver(schema),
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
        addToast('تم التسجيل بنجاح! سنتواصل معك قريباً', 'success')
        reset()
        setTimeout(() => {
          onClose()
          setIsSuccess(false)
        }, 2000)
      } else {
        const errorMsg = response.error || 'حدث خطأ. يرجى المحاولة مرة أخرى.'
        setError(errorMsg)
        addToast(errorMsg, 'error')
      }
    } catch {
      setError('حدث خطأ. يرجى المحاولة مرة أخرى.')
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
            <Typography variant="h6">سجل اهتمامك</Typography>
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
              تم التسجيل بنجاح!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              سنتواصل معك قريباً
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} sm={6}>
                <TextField
                  {...register('firstName')}
                  label="الاسم الأول"
                  placeholder="أحمد"
                  fullWidth
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              </Grid>
              // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} sm={6}>
                <TextField
                  {...register('lastName')}
                  label="اسم العائلة"
                  placeholder="الراشد"
                  fullWidth
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </Grid>
              // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12}>
                <TextField
                  {...register('email')}
                  label="البريد الإلكتروني"
                  type="email"
                  placeholder="ahmed@example.com"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
              // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12}>
                <TextField
                  {...register('phone')}
                  label="رقم الهاتف"
                  type="tel"
                  placeholder="+966 5X XXX XXXX"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </Grid>
              // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12}>
                <TextField
                  {...register('message')}
                  label="ملاحظات (اختياري)"
                  placeholder="أي استفسارات أو ملاحظات..."
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
                إلغاء
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
              </Button>
            </DialogActions>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

