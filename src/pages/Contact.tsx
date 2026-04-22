import { useState, useEffect } from 'react'
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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import { motion } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Instagram, Linkedin, MessageCircle, Video } from 'lucide-react'
import { createLead, getOfficeMapUrl } from '../lib/api-client'

// Custom X (Twitter) icon component
const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Custom TikTok icon component
const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

type FormData = z.infer<ReturnType<typeof getSchema>>

const getSchema = (t: (key: string) => string) => z.object({
  profile: z.enum(['Investor', 'Supplier', 'Operator'], {
    required_error: t('contact.profileRequired'),
    invalid_type_error: t('contact.profileRequired'),
  }),
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
  const [mapUrl, setMapUrl] = useState<string | null>(null)
  const [mapMetaKeywords, setMapMetaKeywords] = useState<string | undefined>(undefined)
  const [isLoadingMap, setIsLoadingMap] = useState(true)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(getSchema(t)),
    defaultValues: {
      profile: 'Investor',
    },
  })

  // Fetch office map URL from Salesforce
  useEffect(() => {
    const fetchMapUrl = async () => {
      setIsLoadingMap(true)
      try {
        const result = await getOfficeMapUrl()
        setMapUrl(result.mapUrl)
        setMapMetaKeywords(result.metaKeywords)
      } catch (error) {
        console.error('Failed to fetch office map URL:', error)
      } finally {
        setIsLoadingMap(false)
      }
    }
    fetchMapUrl()
  }, [])

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
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                            {t('contact.profileQuestion')}
                          </Typography>
                          <Controller
                            name="profile"
                            control={control}
                            render={({ field }) => (
                              <ToggleButtonGroup
                                exclusive
                                value={field.value}
                                onChange={(_, next) => {
                                  if (next) field.onChange(next)
                                }}
                                fullWidth
                                sx={{
                                  bgcolor: 'background.paper',
                                  border: 1,
                                  borderColor: 'divider',
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  '& .MuiToggleButton-root': {
                                    flex: 1,
                                    py: 1.25,
                                    border: 0,
                                    borderRadius: 0,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                  },
                                  '& .MuiToggleButton-root.Mui-selected': {
                                    bgcolor: 'action.selected',
                                    color: 'text.primary',
                                  },
                                  '& .MuiToggleButton-root.Mui-selected:hover': {
                                    bgcolor: 'action.selected',
                                  },
                                }}
                                aria-label={t('contact.profileQuestion')}
                              >
                                <ToggleButton value="Investor">{t('contact.profileOptions.investor')}</ToggleButton>
                                <ToggleButton value="Supplier">{t('contact.profileOptions.supplier')}</ToggleButton>
                                <ToggleButton value="Operator">{t('contact.profileOptions.operator')}</ToggleButton>
                              </ToggleButtonGroup>
                            )}
                          />
                          {errors.profile?.message && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block' }}>
                              {errors.profile.message}
                            </Typography>
                          )}
                        </Grid>
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
                      href: 'https://www.instagram.com/faisalsaedanco',
                      label: t('share.instagram'),
                      color: '#E4405F'
                    },
                    {
                      icon: XIcon,
                      href: 'https://x.com/faisalsaedanco',
                      label: t('share.twitter'),
                      color: '#000000'
                    },
                    {
                      icon: Linkedin,
                      href: 'https://www.linkedin.com/company/faisal-binsaedan',
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
                      icon: TikTokIcon,
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

              {/* Map */}
              <Box
                sx={{
                  mt: 3,
                  aspectRatio: '16/9',
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: 1,
                  borderColor: 'divider',
                  position: 'relative',
                }}
              >
                {isLoadingMap ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <MapPin size={32} color="#718096" style={{ margin: '0 auto 8px', display: 'block' }} />
                      <Typography variant="caption" color="text.secondary">
                        {t('contact.mapPlaceholder')}
                      </Typography>
                    </Box>
                  </Box>
                ) : mapUrl ? (
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={mapMetaKeywords || t('contact.mapTitle') || 'Office Location'}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <MapPin size={32} color="#718096" style={{ margin: '0 auto 8px', display: 'block' }} />
                      <Typography variant="caption" color="text.secondary">
                        {t('contact.mapPlaceholder')}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

