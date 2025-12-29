import { useState } from 'react'
import { Box, Container, Typography, Button, Grid } from '@mui/material'
import { Phone, Mail, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import HeroSection from '../components/home/HeroSection'
import ProjectsGrid from '../components/home/ProjectsGrid'
import RegisterInterestModal from '../components/home/RegisterInterestModal'

export default function Home() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  return (
    <>
      <HeroSection />
      <ProjectsGrid />

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
                لماذا نحن
              </Typography>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                إرث من الثقة والجودة
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '36rem', mx: 'auto' }}>
                نبني مجتمعات متكاملة منذ أكثر من ثلاثة عقود
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {[
                {
                  title: 'جودة البناء',
                  description: 'نلتزم بأعلى معايير الجودة في البناء والتشطيب',
                  icon: '🏗️',
                },
                {
                  title: 'مواقع استراتيجية',
                  description: 'نختار أفضل المواقع لضمان استثمار مستقبلي ناجح',
                  icon: '📍',
                },
                {
                  title: 'خدمة ما بعد البيع',
                  description: 'نقدم خدمات متكاملة لعملائنا حتى بعد التسليم',
                  icon: '🤝',
                },
              ].map((item, index) => (
                // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} md={4} key={item.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                      <Typography variant="h2" sx={{ mb: 2 }}>
                        {item.icon}
                      </Typography>
                      <Typography variant="h6" fontWeight="semibold" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
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
              هل تبحث عن منزل أحلامك؟
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4, maxWidth: '42rem', mx: 'auto' }}>
              سجل اهتمامك الآن وسيتواصل معك فريقنا لمساعدتك في اختيار الوحدة المناسبة
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => setIsRegisterModalOpen(true)}
            >
              سجل اهتمامك الآن
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
                +966 11 234 5678
              </Typography>
            </Box>
            <Box
              component="a"
              href="mailto:info@binsaedan.com"
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
              <Typography variant="body2">info@binsaedan.com</Typography>
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
              <Typography variant="body2">الرياض، المملكة العربية السعودية</Typography>
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

