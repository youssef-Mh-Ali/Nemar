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

  // Auto-play video when it loads
  useEffect(() => {
    if (featuredVideo && featuredVideo.videoUrl && !isLoading) {
      setIsVideoPlaying(true)
    }
  }, [featuredVideo, isLoading])

  useEffect(() => {
    async function loadFeaturedVideo() {
      try {
        const response = await getFeaturedVideo()
        if (response.success && response.data && response.data.videoUrl) {
          setFeaturedVideo(response.data)
          // Auto-play video when it loads
          setIsVideoPlaying(true)
        }
      } catch (error) {
        console.error('Error loading featured video:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadFeaturedVideo()
  }, [])

  // Auto-play video when it becomes available
  useEffect(() => {
    if (featuredVideo && featuredVideo.videoUrl && !isLoading) {
      setIsVideoPlaying(true)
    }
  }, [featuredVideo, isLoading])

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
        {/* Show cover image only while loading or if no video */}
        {(!featuredVideo || !featuredVideo.videoUrl || isLoading) && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: featuredVideo?.coverImageUrl 
                ? `url(${featuredVideo.coverImageUrl})`
                : 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        {featuredVideo && featuredVideo.videoUrl && (
          <Box
            component="iframe"
            src={(() => {
              let videoUrl = featuredVideo.videoUrl.trim()
              
              // For YouTube embeds, ensure autoplay and mute parameters
              if (videoUrl.includes('youtube.com/embed/') || videoUrl.includes('youtu.be/') || videoUrl.includes('youtube.com/watch')) {
                // Extract video ID from various YouTube URL formats
                let videoId = ''
                
                if (videoUrl.includes('/embed/')) {
                  // Already an embed URL: https://www.youtube.com/embed/VIDEO_ID
                  videoId = videoUrl.match(/embed\/([^?&]+)/)?.[1] || ''
                } else if (videoUrl.includes('youtu.be/')) {
                  // Short URL: https://youtu.be/VIDEO_ID?si=...
                  const match = videoUrl.match(/youtu\.be\/([^/?&]+)/)
                  videoId = match?.[1] || ''
                } else if (videoUrl.includes('youtube.com/watch')) {
                  // Watch URL: https://www.youtube.com/watch?v=VIDEO_ID
                  videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1] || ''
                }
                
                if (videoId) {
                  // Build YouTube embed URL with autoplay and mute
                  const params = new URLSearchParams({
                    autoplay: '1',
                    mute: '1',
                    loop: '1',
                    playlist: videoId, // Required for looping
                    controls: '0',
                    showinfo: '0',
                    playsinline: '1',
                    enablejsapi: '1',
                    rel: '0',
                    modestbranding: '1',
                  })
                  videoUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`
                } else {
                  console.warn('Could not extract YouTube video ID from:', videoUrl)
                }
              } else if (videoUrl.includes('instagram.com')) {
                // Instagram embeds - add autoplay if supported
                if (!videoUrl.includes('autoplay')) {
                  videoUrl += (videoUrl.includes('?') ? '&' : '?') + 'autoplay=1&muted=1'
                }
              } else {
                // For other video sources, ensure autoplay and mute
                const separator = videoUrl.includes('?') ? '&' : '?'
                if (!videoUrl.includes('autoplay')) {
                  videoUrl += `${separator}autoplay=1&muted=1&loop=1`
                }
              }
              
              return videoUrl
            })()}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            loading="eager"
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

