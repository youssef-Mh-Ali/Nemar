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
import { createCase } from '../../lib/api-client'
import { useAuthStore } from '../../lib/store'
import { Unit } from '../../lib/types'

const schema = z.object({
  unitId: z.string().optional(),
  subject: z.string().min(5, 'الموضوع مطلوب (5 أحرف على الأقل)'),
  category: z.enum(['Maintenance', 'Inquiry', 'Complaint', 'Documentation', 'Other']),
  description: z.string().min(10, 'الوصف مطلوب (10 أحرف على الأقل)'),
})

type FormData = z.infer<typeof schema>

const categoryOptions = [
  { value: 'Maintenance', label: 'صيانة' },
  { value: 'Inquiry', label: 'استفسار' },
  { value: 'Complaint', label: 'شكوى' },
  { value: 'Documentation', label: 'مستندات' },
  { value: 'Other', label: 'أخرى' },
]

interface CaseFormProps {
  isOpen: boolean
  onClose: () => void
  units: Unit[]
  onSuccess: () => void
}

export default function CaseForm({ isOpen, onClose, units, onSuccess }: CaseFormProps) {
  const { token } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        setError(response.error || 'حدث خطأ. يرجى المحاولة مرة أخرى.')
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
      reset()
    }
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">فتح طلب جديد</Typography>
            <Typography variant="body2" color="text.secondary">
              سيتم الرد عليك في أقرب وقت
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
              تم إنشاء الطلب بنجاح!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              سيتم التواصل معك قريباً
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {units.length > 0 && (
                <TextField
                  {...register('unitId')}
                  select
                  label="الوحدة المتعلقة"
                  fullWidth
                  error={!!errors.unitId}
                  helperText={errors.unitId?.message}
                >
                  <MenuItem value="">اختر وحدة (اختياري)</MenuItem>
                  {units.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.unitNumber} - {u.projectNameAr}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <TextField
                {...register('category')}
                select
                label="نوع الطلب"
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
                label="الموضوع"
                placeholder="مثال: صيانة التكييف"
                fullWidth
                error={!!errors.subject}
                helperText={errors.subject?.message}
              />

              <TextField
                {...register('description')}
                label="التفاصيل"
                placeholder="اشرح طلبك بالتفصيل..."
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
                إلغاء
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </Button>
            </DialogActions>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

