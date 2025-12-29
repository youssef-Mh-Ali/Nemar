import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  IconButton,
} from '@mui/material'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Twitter, Instagram } from 'lucide-react'
import { createLead } from '../lib/api-client'

const schema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'اسم العائلة مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(9, 'رقم الهاتف غير صحيح'),
  message: z.string().min(10, 'الرسالة مطلوبة'),
})

type FormData = z.infer<typeof schema>

const contactInfo = [
  {
    icon: Phone,
    label: 'الهاتف',
    value: '+966 11 234 5678',
    href: 'tel:+966112345678',
  },
  {
    icon: Mail,
    label: 'البريد الإلكتروني',
    value: 'info@binsaedan.com',
    href: 'mailto:info@binsaedan.com',
  },
  {
    icon: MapPin,
    label: 'العنوان',
    value: 'الرياض، المملكة العربية السعودية',
  },
  {
    icon: Clock,
    label: 'ساعات العمل',
    value: 'الأحد - الخميس، 9 ص - 5 م',
  },
]

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/binsaedan', label: 'تويتر' },
  { icon: Instagram, href: 'https://instagram.com/binsaedan', label: 'انستقرام' },
]

export default function Contact() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)

    try {
      const response = await createLead(data)

      if (response.success) {
        setIsSuccess(true)
        reset()
        setTimeout(() => setIsSuccess(false), 5000)
      } else {
        setError(response.error || 'حدث خطأ. يرجى المحاولة مرة أخرى.')
      }
    } catch {
      setError('حدث خطأ. يرجى المحاولة مرة أخرى.')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', px: { xs: 2, md: 3 }, py: 6, textAlign: 'center' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              تواصل معنا
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '42rem', mx: 'auto' }}>
              نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو ملاحظات
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Contact Form */}
          // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="semibold" gutterBottom>
                    أرسل لنا رسالة
                  </Typography>

                  {isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ fontSize: 64, color: 'success.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <CheckCircle size={64} color="#38a169" />
                      </Box>
                        <Typography variant="h6" fontWeight="semibold" gutterBottom>
                          تم إرسال رسالتك!
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          سنتواصل معك قريباً
                        </Typography>
                      </Box>
                    </motion.div>
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
                            label="رسالتك"
                            placeholder="كيف يمكننا مساعدتك؟"
                            fullWidth
                            multiline
                            rows={4}
                            error={!!errors.message}
                            helperText={errors.message?.message}
                          />
                        </Grid>
                      </Grid>

                      {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          {error}
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isSubmitting}
                        startIcon={<Send size={20} />}
                        sx={{ mt: 2 }}
                      >
                        {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Contact Info */}
          // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="semibold" gutterBottom>
                  معلومات التواصل
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {contactInfo.map((item) => {
                    const Icon = item.icon
                    const content = (
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'primary.main',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Icon size={20} color="white" />
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {item.label}
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {item.value}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    )

                    return item.href ? (
                      <Box
                        key={item.label}
                        component="a"
                        href={item.href}
                        sx={{ textDecoration: 'none', '&:hover': { opacity: 0.8 } }}
                      >
                        {content}
                      </Box>
                    ) : (
                      <Box key={item.label}>{content}</Box>
                    )
                  })}
                </Box>
              </Box>

              {/* Social Links */}
              <Box>
                <Typography variant="h6" fontWeight="semibold" gutterBottom>
                  تابعنا
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <IconButton
                        key={social.label}
                        component="a"
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        aria-label={social.label}
                      >
                        <Icon size={20} />
                      </IconButton>
                    )
                  })}
                </Box>
              </Box>

              {/* Map Placeholder */}
              <Box
                sx={{
                  mt: 3,
                  aspectRatio: '16/9',
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <MapPin size={32} color="#718096" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <Typography variant="caption" color="text.secondary">
                    الخريطة ستظهر هنا
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

