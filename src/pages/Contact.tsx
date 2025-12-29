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
import { useTranslation } from 'react-i18next'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Twitter, Instagram, Linkedin, MessageCircle, Video } from 'lucide-react'
import { createLead } from '../lib/api-client'

type FormData = z.infer<ReturnType<typeof getSchema>>

const getSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(2, t('registerInterest.firstNameRequired')),
  lastName: z.string().min(2, t('registerInterest.lastNameRequired')),
  email: z.string().email(t('registerInterest.emailInvalid')),
  phone: z.string().min(9, t('registerInterest.phoneInvalid')),
  message: z.string().min(10, t('contact.message')),
})

export default function Contact() {
  const { t } = useTranslation()
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(getSchema(t)),
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
        setError(response.error || t('contact.errorOccurred'))
      }
    } catch {
      setError(t('contact.errorOccurred'))
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
              {t('contact.title')}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '42rem', mx: 'auto' }}>
              {t('contact.description')}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="semibold" gutterBottom>
                    {t('contact.formTitle')}
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
                          {t('contact.messageSent')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('contact.willContactSoon')}
                        </Typography>
                      </Box>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            {...register('firstName')}
                            label={t('contact.firstName')}
                            placeholder={t('contact.firstNamePlaceholder')}
                            fullWidth
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            {...register('lastName')}
                            label={t('contact.lastName')}
                            placeholder={t('contact.lastNamePlaceholder')}
                            fullWidth
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            {...register('email')}
                            label={t('contact.email')}
                            type="email"
                            placeholder={t('contact.emailPlaceholder')}
                            fullWidth
                            error={!!errors.email}
                            helperText={errors.email?.message}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            {...register('phone')}
                            label={t('contact.phone')}
                            type="tel"
                            placeholder={t('contact.phonePlaceholder')}
                            fullWidth
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            {...register('message')}
                            label={t('contact.message')}
                            placeholder={t('contact.messagePlaceholder')}
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
                        {isSubmitting ? t('contact.submitting') : t('contact.send')}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Contact Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="semibold" gutterBottom>
                  {t('contact.contactInfo')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    {
                      icon: Phone,
                      label: t('contact.phoneLabel'),
                      value: '+966 11 234 5678',
                      href: 'tel:+966112345678',
                    },
                    {
                      icon: Mail,
                      label: t('contact.emailLabel'),
                      value: 'info@binsaedan.com',
                      href: 'mailto:info@binsaedan.com',
                    },
                    {
                      icon: MapPin,
                      label: t('contact.addressLabel'),
                      value: t('contact.address'),
                    },
                    {
                      icon: Clock,
                      label: t('contact.workingHours'),
                      value: t('contact.workingHoursValue'),
                    },
                  ].map((item) => {
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
                  {t('contact.followUs')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[
                    { 
                      icon: Instagram, 
                      href: 'https://www.instagram.com/faisalsaedanco?igshid=NzZlODBkYWE4Ng%3D%3D', 
                      label: t('share.instagram'),
                      color: '#E4405F'
                    },
                    { 
                      icon: Twitter, 
                      href: 'https://x.com/faisalsaedanco', 
                      label: t('share.twitter'),
                      color: '#000000'
                    },
                    { 
                      icon: Linkedin, 
                      href: 'https://www.linkedin.com/company/faisal-binsaedan/posts/?feedView=all', 
                      label: t('share.linkedin'),
                      color: '#0077B5'
                    },
                    { 
                      icon: MessageCircle, 
                      href: 'https://wa.me/966920024010', 
                      label: t('share.whatsapp'),
                      color: '#25D366'
                    },
                    { 
                      icon: Video, 
                      href: 'https://www.snapchat.com/@binsaedanco', 
                      label: t('share.snapchat'),
                      color: '#FFFC00'
                    },
                    { 
                      icon: Video, 
                      href: 'https://www.tiktok.com/@faisalbinsaedan.c', 
                      label: t('share.tiktok'),
                      color: '#000000'
                    },
                  ].map((social) => {
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
                          '&:hover': { 
                            bgcolor: 'action.hover',
                            borderColor: social.color || 'primary.main',
                            '& svg': {
                              color: social.color || 'primary.main',
                            }
                          },
                        }}
                        aria-label={social.label}
                        title={social.label}
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
                    {t('contact.mapPlaceholder')}
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

