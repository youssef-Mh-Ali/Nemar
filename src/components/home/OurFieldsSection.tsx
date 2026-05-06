import { Box, Container, Typography, Grid } from '@mui/material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function OurFieldsSection() {
  const { t, i18n } = useTranslation()

  // For now using static copy, but it could be added to i18n
  // if requested, I'll use English and Arabic depending on the current lang.
  const fields = [
    {
      id: 'residential',
      image: '/projects/malfa/hero.jpg', // Placeholder, we can update if needed
      titleEn: 'Residential Projects',
      titleAr: 'المشاريع السكنية',
      descEn: 'Faisal bin Saedan residential projects provide inspiring havens with sustainable environmental designs that meet all your basic and luxury needs, from internal protection and living services to stunning views, as they are designed to suit your distinctive lifestyle.',
      descAr: 'توفر مشاريع فيصل بن سعيدان السكنية ملاذات ملهمة بتصاميم بيئية مستدامة تلبي جميع احتياجاتك الأساسية والفاخرة، صُممت لتناسب أسلوب حياتك المميز.',
      link: '/search?type=residential'
    },
    {
      id: 'commercial',
      image: '/projects/nozol/hero.jpg', // Placeholder
      titleEn: 'Commercial Projects',
      titleAr: 'المشاريع التجارية',
      descEn: 'Our carefully selected commercial buildings inspire you to pursue your entrepreneurial dreams, as we provide the ideal starting point for whatever your business growth may be, from retail and entertainment venues to modern office space.',
      descAr: 'تلهمك مبانينا التجارية المختارة بعناية لتحقيق أحلامك الريادية، حيث نوفر نقطة الانطلاق المثالية لنمو أعمالك، من مساحات التجزئة والترفيه إلى المساحات المكتبية الحديثة.',
      link: '/search?type=commercial'
    }
  ]

  const isRtl = i18n.language === 'ar'

  return (
    <Box sx={{ py: 8, px: { xs: 2, md: 3 }, bgcolor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(20px)' }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h3"
            fontWeight="600"
            color="primary.main"
            gutterBottom
            sx={{ mb: 6 }}
          >
            {isRtl ? 'مجالاتنا' : 'Our Fields'}
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {fields.map((field, index) => (
            <Grid item xs={12} md={6} key={field.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 240, md: 320 },
                      mb: 3,
                      overflow: 'hidden',
                      borderRadius: 2
                    }}
                  >
                    <Box
                      component="img"
                      src={field.image}
                      alt={isRtl ? field.titleAr : field.titleEn}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                      onError={(e: any) => {
                        // Fallback image if local project images are missing
                        e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'
                      }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight="500" color="primary.main" gutterBottom sx={{ mb: 2 }}>
                    {isRtl ? field.titleAr : field.titleEn}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, flexGrow: 1, lineHeight: 1.7, fontSize: '0.95rem' }}>
                    {isRtl ? field.descAr : field.descEn}
                  </Typography>
                  <Box
                    component={Link}
                    to={field.link}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontWeight: 700,
                      color: 'primary.main',
                      textDecoration: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '0.85rem',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                  >
                    {isRtl ? 'اقرأ المزيد ←' : 'Read More →'}
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
