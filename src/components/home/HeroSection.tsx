import { useEffect, useState } from 'react'
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getFeaturedVideo } from '../../lib/api-client'

// Type declaration for Instagram embed API
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}

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
      console.log('[Hero Section] Loading featured video...')
      try {
        const response = await getFeaturedVideo()
        console.log('[Hero Section] Video fetch response:', response)
        
        if (response.success && response.data) {
          console.log('[Hero Section] ✅ Video data received:', {
            hasVideoUrl: !!response.data.videoUrl,
            videoUrl: response.data.videoUrl,
            hasCoverImage: !!response.data.coverImageUrl,
            projectName: response.data.projectNameAr,
          })
          
          if (response.data.videoUrl) {
            setFeaturedVideo(response.data)
            // Auto-play video when it loads
            setIsVideoPlaying(true)
            console.log('[Hero Section] ✅ Video set and marked for playback')
          } else {
            console.warn('[Hero Section] ⚠️ No video URL in response data')
          }
        } else {
          console.warn('[Hero Section] ⚠️ No video data in response:', response)
        }
      } catch (error) {
        console.error('[Hero Section] ❌ Error loading featured video:', error)
      } finally {
        setIsLoading(false)
        console.log('[Hero Section] Loading complete')
      }
    }
    loadFeaturedVideo()
  }, [])

  // Auto-play video when it becomes available
  useEffect(() => {
    if (featuredVideo && featuredVideo.videoUrl && !isLoading) {
      console.log('[Hero Section] ✅ Video available, setting to play:', featuredVideo.videoUrl)
      setIsVideoPlaying(true)
    } else {
      console.log('[Hero Section] Video not ready:', {
        hasFeaturedVideo: !!featuredVideo,
        hasVideoUrl: !!featuredVideo?.videoUrl,
        isLoading,
        isVideoPlaying,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredVideo, isLoading])

  // Load Instagram embed script when Instagram video is present
  useEffect(() => {
    if (featuredVideo?.videoUrl?.includes('instagram.com')) {
      // Check if script is already loaded
      if (window.instgrm) {
        console.log('[Hero Section] Instagram embed script already loaded, processing embeds...')
        window.instgrm.Embeds.process()
        return
      }

      // Load Instagram embed script
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      script.onload = () => {
        console.log('[Hero Section] ✅ Instagram embed script loaded')
        if (window.instgrm) {
          window.instgrm.Embeds.process()
        }
      }
      script.onerror = () => {
        console.error('[Hero Section] ❌ Failed to load Instagram embed script')
      }
      document.body.appendChild(script)

      return () => {
        // Cleanup: remove script if component unmounts
        const existingScript = document.querySelector('script[src="https://www.instagram.com/embed.js"]')
        if (existingScript) {
          document.body.removeChild(existingScript)
        }
      }
    }
  }, [featuredVideo])

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
          <>
            {/* Instagram videos use official embed method */}
            {featuredVideo.videoUrl.includes('instagram.com') ? (
              <Box
                component="blockquote"
                className="instagram-media"
                data-instgrm-permalink={featuredVideo.videoUrl}
                data-instgrm-version="14"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  margin: 0,
                  padding: 0,
                  background: 'transparent',
                  border: 'none',
                  zIndex: 1,
                  '& iframe': {
                    width: '100% !important',
                    height: '100% !important',
                    border: 'none',
                  },
                }}
              />
            ) : (
              /* YouTube and Google Drive videos use iframe */
              <Box
                component="iframe"
                src={(() => {
                  // Video URL is already processed by the API client
                  // Just use it directly as it should already be in embed format with autoplay
                  const videoUrl = featuredVideo.videoUrl.trim()
                  console.log('[Hero Section] Using processed video URL for iframe (autoplay enabled):', videoUrl)
                  return videoUrl
                })()}
                onLoad={() => {
                  console.log('[Hero Section] ✅ Video iframe loaded successfully - autoplay should start')
                  setIsVideoPlaying(true)
                }}
                onError={(e) => {
                  console.error('[Hero Section] ❌ Video iframe failed to load:', e)
                }}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-read; clipboard-write"
                allowFullScreen
                loading="eager"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox allow-autoplay"
              />
            )}
          </>
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

