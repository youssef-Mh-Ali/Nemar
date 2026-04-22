import { useState, useEffect } from 'react'
import { Box, Container, Typography, Button, Grid, IconButton } from '@mui/material'
import { Construction, LocationOn, Handshake } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import HeroSection from '../components/home/HeroSection'
import ProjectsGrid from '../components/home/ProjectsGrid'
import RegisterInterestModal from '../components/home/RegisterInterestModal'

import { Phone, Mail, MapPin, Instagram, Linkedin, MessageCircle, Video, Facebook } from 'lucide-react'

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




export default function Home() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    // Update HTML lang and dir attributes when language changes
    document.documentElement.lang = i18n.language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
  }, [i18n.language])

  return (
    <>
      <HeroSection />
      <ProjectsGrid />

      {/* CMA Section */}
      <Box sx={{ py: 6, px: { xs: 2, md: 3 }, bgcolor: 'white', textAlign: 'center' }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Box
              component="img"
              src="/Capital-Market-Authority-01.png"
              alt="Capital Market Authority"
              sx={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: 350,
                objectFit: 'contain',
                mb: 4
              }}
            />
            <Typography variant="body1" sx={{ maxWidth: '800px', mx: 'auto', color: 'text.secondary', lineHeight: 1.8 }}>
              {t('home.cmaDescription')}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Box sx={{ py: 8, px: { xs: 2, md: 3 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'secondary.main',
                  fontWeight: 500,
                  mb: 1,
                  display: 'block',
                }}
              >
                {t('home.whyChooseUs')}
              </Typography>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {t('home.legacyTitle')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '36rem', mx: 'auto' }}>
                {t('home.legacyDescription')}
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {[
                {
                  title: t('home.qualityTitle'),
                  description: t('home.qualityDescription'),
                  icon: Construction,
                },
                {
                  title: t('home.locationTitle'),
                  description: t('home.locationDescription'),
                  icon: LocationOn,
                },
                {
                  title: t('home.serviceTitle'),
                  description: t('home.serviceDescription'),
                  icon: Handshake,
                },
              ].map((item, index) => {
                const IconComponent = item.icon
                return (
                  <Grid size={{ xs: 12, md: 4 }} key={item.title}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            mb: 2,
                          }}
                        >
                          <IconComponent sx={{ fontSize: 40 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="semibold" gutterBottom>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                )
              })}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, px: { xs: 2, md: 3 }, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {t('home.ctaTitle')}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4, maxWidth: '42rem', mx: 'auto' }}>
              {t('home.ctaDescription')}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => setIsRegisterModalOpen(true)}
            >
              {t('home.registerInterest')}
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Contact Info */}
      <Box sx={{ py: 6, px: { xs: 2, md: 3 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
            <Box
              component="a"
              href="tel:+966112345678"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Phone size={20} />
              <Typography variant="body2" dir="ltr">
                {t('home.phone')}
              </Typography>
            </Box>
            <Box
              component="a"
              href={`mailto:${t('home.email')}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Mail size={20} />
              <Typography variant="body2">{t('home.email')}</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: 'text.secondary',
              }}
            >
              <MapPin size={20} />
              <Typography variant="body2">{t('home.address')}</Typography>
            </Box>


            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                {
                  icon: Instagram,
                  href: 'https://www.instagram.com/faisalsaedanco?igsh=MXBvazg2d3lnNDQ4bQ==',
                  label: t('share.instagram'),
                  color: '#E4405F'
                },
                {
                  icon: XIcon,
                  href: 'https://x.com/FaisalSaedanCo',
                  label: t('share.twitter'),
                  color: '#000000'
                },
                {
                  icon: Linkedin,
                  href: 'https://www.linkedin.com/company/faisal-binsaedan/',
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
                  icon: Facebook,
                  href: 'https://www.facebook.com/faisalsaedanco/',
                  label: t('share.facebook'),
                  color: '#1877F2'
                },
                {
                  icon: Video,
                  href: 'https://www.snapchat.com/@binsaedanco',
                  label: t('share.snapchat'),
                  color: '#FFFC00'
                },
                {
                  icon: TikTokIcon,
                  href: 'https://www.tiktok.com/@fbs.c?_r=1&_t=ZS-95iiXSKM2iI ',
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


        </Container>
      </Box>

      {/* Register Interest Modal */}
      <RegisterInterestModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </>
  )
}

