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
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Instagram, Linkedin } from 'lucide-react'
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

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.04 2C6.55 2 2.08 6.47 2.08 11.96c0 1.77.46 3.5 1.33 5.02L2 22l5.15-1.35a9.9 9.9 0 0 0 4.89 1.25h.01c5.49 0 9.96-4.47 9.96-9.96C22.01 6.47 17.54 2 12.04 2Zm0 17.99h-.01a8.3 8.3 0 0 1-4.22-1.16l-.3-.18-3.06.8.82-2.98-.2-.31a8.26 8.26 0 0 1-1.26-4.4c0-4.58 3.73-8.3 8.31-8.3 4.58 0 8.31 3.72 8.31 8.3 0 4.58-3.73 8.3-8.39 8.3Zm4.82-6.2c-.26-.13-1.53-.75-1.77-.84-.24-.09-.41-.13-.58.13-.17.26-.67.84-.82 1.01-.15.17-.3.2-.56.07-.26-.13-1.08-.4-2.06-1.27-.76-.68-1.27-1.52-1.42-1.78-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.39-.79-1.9-.21-.5-.43-.43-.58-.44h-.5c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.15 0 1.27.92 2.5 1.05 2.68.13.17 1.81 2.76 4.38 3.87.61.26 1.08.42 1.45.54.61.19 1.16.16 1.6.1.49-.07 1.53-.62 1.75-1.22.22-.6.22-1.12.15-1.22-.06-.1-.23-.16-.49-.29Z" />
  </svg>
)

const SnapchatIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Simplified Snapchat ghost mark */}
    <path d="M12 2.25c-2.6 0-4.7 2.07-4.7 4.63v3.02c0 .22-.2.41-.46.46-.55.1-1.06.35-1.45.71-.42.39-.72.9-.86 1.47-.04.18-.18.32-.36.37l-.6.16c-.38.1-.38.65 0 .75l.6.16c.18.05.32.19.36.37.14.57.44 1.08.86 1.47.62.58 1.46.88 2.33.83.24-.01.46.15.51.38.17.83.6 1.57 1.23 2.1.62.52 1.4.8 2.19.8.79 0 1.57-.28 2.19-.8.63-.53 1.06-1.27 1.23-2.1.05-.23.27-.39.51-.38.87.05 1.71-.25 2.33-.83.42-.39.72-.9.86-1.47.04-.18.18-.32.36-.37l.6-.16c.38-.1.38-.65 0-.75l-.6-.16c-.18-.05-.32-.19-.36-.37a3.35 3.35 0 0 0-.86-1.47c-.39-.36-.9-.61-1.45-.71-.26-.05-.46-.24-.46-.46V6.88c0-2.56-2.1-4.63-4.7-4.63Z" />
  </svg>
)

type FormData = z.infer<ReturnType<typeof getSchema>>

const getSchema = (t: (key: string) => string) => z.object({
  profile: z.enum(['Investor', 'Customer']),
  name: z.string().min(2, t('registerInterest.firstNameRequired')),
  email: z.union([z.string().email(t('registerInterest.emailInvalid')), z.literal('')]).optional(),
  phone: z.string().min(9, t('registerInterest.phoneInvalid')),
  region: z.string().optional(),
  city: z.string().optional(),
  project: z.string().optional(),
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
      const parts = data.name.trim().split(/\s+/).filter(Boolean)
      const firstName = parts[0] || ''
      const lastName = parts.slice(1).join(' ') || firstName
      const meta = [
        data.region ? `Region: ${data.region}` : null,
        data.city ? `City: ${data.city}` : null,
        data.project ? `Project: ${data.project}` : null,
      ].filter(Boolean)
      const message = meta.length ? `${data.message}\n\n${meta.join('\n')}` : data.message

      const response = await createLead({
        profile: data.profile,
        firstName,
        lastName,
        phone: data.phone,
        email: data.email || '',
        message,
      })

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
                                <ToggleButton value="Customer">{t('contact.profileOptions.customer', 'Customer')}</ToggleButton>
                              </ToggleButtonGroup>
                            )}
                          />
                          {errors.profile?.message && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block' }}>
                              {errors.profile.message}
                            </Typography>
                          )}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            {...register('name')}
                            label={t('contact.name', 'Name')}
                            placeholder={t('contact.namePlaceholder', 'Your name')}
                            fullWidth
                            error={!!errors.name}
                            helperText={errors.name?.message}
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
                            required
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            {...register('region')}
                            label={t('contact.region', 'Region')}
                            placeholder={t('contact.regionPlaceholder', 'Your region')}
                            fullWidth
                            error={!!errors.region}
                            helperText={errors.region?.message}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            {...register('city')}
                            label={t('contact.city', 'City')}
                            placeholder={t('contact.cityPlaceholder', 'Your city')}
                            fullWidth
                            error={!!errors.city}
                            helperText={errors.city?.message}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            {...register('project')}
                            label={t('contact.project', 'Project')}
                            placeholder={t('contact.projectPlaceholder', 'Project name')}
                            fullWidth
                            error={!!errors.project}
                            helperText={errors.project?.message}
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
                      value: 'info@faisal-binsaedan.com',
                      href: 'mailto:info@faisal-binsaedan.com',
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
                      icon: WhatsAppIcon,
                      href: 'https://wa.me/966920024010',
                      label: t('share.whatsapp'),
                      color: '#25D366'
                    },
                    {
                      icon: SnapchatIcon,
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

