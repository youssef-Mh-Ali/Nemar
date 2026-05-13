import { Box, Container, Typography, Grid } from '@mui/material'
import { motion, useInView, useAnimation } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'

function Counter({ value, suffix = '', duration = 2 }: { value: number, suffix?: string, duration?: number }) {
  const { i18n } = useTranslation()
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (isInView) {
      let start = 0
      const increment = value / (duration * 60)
      const timer = setInterval(() => {
        start += increment
        if (start >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 1000 / 60)
      return () => clearInterval(timer)
    }
  }, [isInView, value, duration])

  const isRtl = i18n.language.startsWith('ar')

  return (
    <Box ref={ref} sx={{ display: 'inline-flex', alignItems: 'baseline' }}>
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '3rem', md: '4.5rem' },
          fontWeight: 700,
          color: 'primary.main',
          lineHeight: 1,
        }}
      >
        {suffix === '+' ? (isRtl ? `${count.toLocaleString()}+` : `+${count.toLocaleString()}`) : count.toLocaleString()}
      </Typography>
    </Box>
  )
}

export default function StatsSection() {
  const { t } = useTranslation()

  const stats = [
    { value: 3508, label: t('home.stats.housing', 'Housing units'), suffix: '' },
    { value: 200, label: t('home.stats.exhibitions', 'Exhibitions'), suffix: '+' },
    { value: 32, label: t('home.stats.drivethrough', 'Drive Through'), suffix: '+' },
    { value: 11, label: t('home.stats.plaza', 'Plaza'), suffix: '+' },
  ]

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, overflow: 'hidden' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4, lg: 6 } }}>
        
        {/* Top Header Area */}
        <Grid container spacing={4} sx={{ mb: { xs: 8, md: 12 } }}>
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 800,
                  color: 'primary.main',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                {t('home.statsTitle', 'Strong foundation and advanced innovations')}
              </Typography>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'primary.dark',
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                  maxWidth: '400px',
                }}
              >
                {t('home.statsDesc', 'At Faisal Bin Saedan, we strive to implement modern architectural styles and inspiring innovations with a strong foundation.')}
              </Typography>
            </motion.div>
          </Grid>
        </Grid>

        {/* Counters */}
        <Grid container spacing={4} justifyContent="space-between">
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
              >
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Counter value={stat.value} suffix={stat.suffix} />
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 500,
                      mt: 1,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  )
}
