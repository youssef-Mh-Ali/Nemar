import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Box, Container, Typography, Button, Grid } from '@mui/material'
import { Construction, LocationOn, Handshake } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import HeroSection from '../components/home/HeroSection'
import ProjectsGrid from '../components/home/ProjectsGrid'
import RegisterInterestModal from '../components/home/RegisterInterestModal'

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
                display: 'block',
                maxWidth: 'min(100%, 420px)',
                height: 'auto',
                maxHeight: { xs: 160, sm: 200, md: 220 },
                objectFit: 'contain',
                mx: 'auto',
                mb: 4
              }}
            />
            <Typography variant="body1" sx={{ maxWidth: '800px', mx: 'auto', color: 'text.secondary', lineHeight: 1.8 }}>
              {t('home.cmaDescription')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                maxWidth: '640px',
                mx: 'auto',
                mt: 3,
                color: 'text.secondary',
                lineHeight: 1.7,
                fontWeight: 500,
              }}
            >
              {t('home.cmaCollaborationTeaser')}
            </Typography>
            <Button
              component={Link}
              to="/collaboration-coming-soon"
              variant="outlined"
              size="medium"
              sx={{ mt: 2.5, textTransform: 'none', fontWeight: 600 }}
            >
              {t('home.cmaCollaborationCta')}
            </Button>
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
                  color: 'primary.light',
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
              variant="outlined"
              size="large"
              onClick={() => setIsRegisterModalOpen(true)}
              sx={{
                px: { xs: 2.25, sm: 2.75 },
                py: { xs: 1, sm: 1.125 },
                gap: 0.5,
                borderRadius: 1.5,
                borderWidth: 1.5,
                fontWeight: 500,
                borderColor: 'rgba(255, 255, 255, 0.75)',
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                '&:hover': {
                  borderWidth: 1.5,
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                },
              }}
            >
              {t('home.registerInterest')}
            </Button>
          </motion.div>
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

