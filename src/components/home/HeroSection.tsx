import { useEffect, useState } from 'react'
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material'
import { motion } from 'framer-motion'
import { Play, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getFeaturedVideo } from '../../lib/api-client'

interface FeaturedVideo {
  projectId: string
  projectName: string
  projectNameAr: string
  videoUrl: string
  coverImageUrl: string
}

export default function HeroSection() {
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideo | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadFeaturedVideo() {
      try {
        const response = await getFeaturedVideo()
        if (response.success && response.data) {
          setFeaturedVideo(response.data)
        }
      } catch (error) {
        console.error('Error loading featured video:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadFeaturedVideo()
  }, [])

  const scrollToProjects = () => {
    document.getElementById('latest-projects')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '85vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      <Box sx={{ position: 'absolute', inset: 0 }}>
        {featuredVideo && !isVideoPlaying && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${featuredVideo.coverImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        {isVideoPlaying && featuredVideo && (
          <Box
            component="iframe"
            src={`${featuredVideo.videoUrl}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0`}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              pointerEvents: 'none',
            }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}
        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(15, 31, 58, 0.7), rgba(15, 31, 58, 0.5), rgba(15, 31, 58, 0.9))',
          }}
        />
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, textAlign: 'center', px: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ marginBottom: '32px' }}
          >
            <Box
              component="img"
              src="/BinSaedanLogo-White.png"
              alt="فيصل بن سعيدان"
              sx={{
                height: { xs: '64px', md: '80px' },
                width: 'auto',
                mx: 'auto',
              }}
            />
          </motion.div>

          {/* Main Heading */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', md: '3rem', lg: '3.75rem' },
              fontWeight: 'bold',
              color: 'white',
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            مجتمعك،
            <br />
            <Box component="span" sx={{ color: 'secondary.main' }}>
              بأسلوب جديد
            </Box>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 4,
              maxWidth: '42rem',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            اكتشف أرقى المشاريع السكنية في المملكة العربية السعودية.
            <Box component="br" sx={{ display: { xs: 'none', md: 'block' } }} />
            نبني مجتمعات متكاملة للأجيال القادمة.
          </Typography>

          {/* CTAs */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/search"
              variant="contained"
              color="secondary"
              size="large"
              sx={{ minWidth: '200px' }}
            >
              استكشف المشاريع
            </Button>
            {!isVideoPlaying && featuredVideo && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => setIsVideoPlaying(true)}
                startIcon={<Play size={20} />}
                sx={{
                  minWidth: '200px',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                شاهد الفيديو
              </Button>
            )}
          </Box>
        </motion.div>
      </Container>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        onClick={scrollToProjects}
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          cursor: 'pointer',
        }}
        aria-label="انتقل للأسفل"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown size={32} />
        </motion.div>
      </motion.button>

      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'primary.dark',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      )}
    </Box>
  )
}

