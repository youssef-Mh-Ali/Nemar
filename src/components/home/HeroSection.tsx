import { useEffect, useState, useRef } from 'react'
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getFeaturedVideo, detectVideoAspectRatio } from '../../lib/api-client'
import VideoCover from './VideoCover'
import VideoOverlay from './VideoOverlay'

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
  aspectRatio?: number
}

export default function HeroSection() {
  const { t } = useTranslation()
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideo | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [instagramEmbedFailed, setInstagramEmbedFailed] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9) // Default fallback: 16:9
  const videoRef = useRef<HTMLVideoElement>(null)

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
            aspectRatio: response.data.aspectRatio,
          })
          
          if (response.data.videoUrl) {
            let finalAspectRatio = response.data.aspectRatio

            // Priority 1: Use aspect ratio from Salesforce if available
            if (finalAspectRatio) {
              console.log('[Hero Section] ✅ Using aspect ratio from Salesforce:', finalAspectRatio)
              setAspectRatio(finalAspectRatio)
            } else {
              // Priority 2: Detect from native video metadata if it's a native video
              const isNativeVideo = /\.(mp4|webm|ogg|m3u8|mov|avi)(\?|$)/i.test(response.data.videoUrl) ||
                                    response.data.videoUrl.startsWith('blob:') ||
                                    response.data.videoUrl.startsWith('data:video/')
              
              if (isNativeVideo) {
                console.log('[Hero Section] Attempting to detect aspect ratio from video metadata...')
                try {
                  const detectedRatio = await detectVideoAspectRatio(response.data.videoUrl)
                  if (detectedRatio) {
                    finalAspectRatio = detectedRatio
                    console.log('[Hero Section] ✅ Detected aspect ratio from video metadata:', detectedRatio)
                    setAspectRatio(detectedRatio)
                  } else {
                    console.log('[Hero Section] ⚠️ Could not detect aspect ratio, using fallback 16:9')
                    setAspectRatio(16 / 9)
                  }
                } catch (error) {
                  console.warn('[Hero Section] ⚠️ Error detecting aspect ratio:', error)
                  setAspectRatio(16 / 9)
                }
              } else {
                // Priority 3: Fallback to 16:9 for embedded videos (YouTube, etc.)
                // Instagram videos are typically 1:1 or 9:16, but we'll use 16:9 as safe default
                // unless we can detect it from the URL pattern
                if (response.data.videoUrl.includes('instagram.com/reel/')) {
                  // Instagram Reels are typically 9:16 (vertical)
                  setAspectRatio(9 / 16)
                  console.log('[Hero Section] Using Instagram Reel aspect ratio (9:16)')
                } else if (response.data.videoUrl.includes('instagram.com/p/')) {
                  // Instagram posts are typically 1:1 (square)
                  setAspectRatio(1)
                  console.log('[Hero Section] Using Instagram post aspect ratio (1:1)')
                } else {
                  // Default fallback: 16:9
                  setAspectRatio(16 / 9)
                  console.log('[Hero Section] Using default aspect ratio (16:9)')
                }
              }
            }

            setFeaturedVideo({
              ...response.data,
              aspectRatio: finalAspectRatio,
            })
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
      // Reset failed state when video changes
      setInstagramEmbedFailed(false)

      // Check if script is already loaded
      if (window.instgrm) {
        console.log('[Hero Section] Instagram embed script already loaded, processing embeds...')
        window.instgrm.Embeds.process()
        return
      }

      // Try to load Instagram embed script
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      script.onload = () => {
        console.log('[Hero Section] ✅ Instagram embed script loaded')
        // Wait a bit for the script to initialize
        setTimeout(() => {
          if (window.instgrm) {
            window.instgrm.Embeds.process()
          } else {
            console.warn('[Hero Section] ⚠️ Instagram embed script loaded but instgrm not available')
            setInstagramEmbedFailed(true)
          }
        }, 100)
      }
      script.onerror = () => {
        console.error('[Hero Section] ❌ Failed to load Instagram embed script (likely blocked by ad blocker)')
        console.log('[Hero Section] Falling back to clickable link UI')
        setInstagramEmbedFailed(true)
      }
      
      // Add timeout fallback in case script loads but doesn't initialize
      const timeout = setTimeout(() => {
        if (!window.instgrm) {
          console.warn('[Hero Section] ⚠️ Instagram embed script timeout, using fallback UI')
          setInstagramEmbedFailed(true)
        }
      }, 3000)

      document.body.appendChild(script)

      return () => {
        clearTimeout(timeout)
        // Cleanup: remove script if component unmounts
        const existingScript = document.querySelector('script[src="https://www.instagram.com/embed.js"]')
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript)
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
        {/* Animated dark overlay for readability */}
        {(featuredVideo?.videoUrl || featuredVideo?.coverImageUrl) && <VideoOverlay />}
        
        {featuredVideo && featuredVideo.videoUrl && (
          <>
            {/* Instagram videos use official embed method with fallback UI */}
            {featuredVideo.videoUrl.includes('instagram.com') ? (
              instagramEmbedFailed ? (
                // Fallback: Show clickable link/image when embed is blocked
                <Box
                  component="a"
                  href={featuredVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    background: featuredVideo.coverImageUrl
                      ? `url(${featuredVideo.coverImageUrl})`
                      : 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.9,
                    },
                  }}
                >
                  <Box
                    sx={{
                      textAlign: 'center',
                      color: 'white',
                      p: 3,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: 2,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      شاهد الفيديو على Instagram
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      اضغط للفتح
                    </Typography>
                  </Box>
                </Box>
              ) : (
                // Official Instagram embed method with VideoCover wrapper
                <VideoCover
                  aspectRatio={aspectRatio}
                  mediaType="instagram"
                  sx={{ zIndex: 1 }}
                >
                <Box
                  component="blockquote"
                  className="instagram-media"
                  data-instgrm-permalink={featuredVideo.videoUrl}
                  data-instgrm-version="14"
                  sx={{
                    width: '100%',
                    height: '100%',
                    margin: 0,
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    display: 'block',
                    '& iframe': {
                      width: '100% !important',
                      height: '100% !important',
                      border: 'none',
                      display: 'block',
                    },
                  }}
                />
                </VideoCover>
              )
            ) : (
              /* Check if it's a native video or iframe embed */
              (() => {
                const isNativeVideo = /\.(mp4|webm|ogg|m3u8|mov|avi)(\?|$)/i.test(featuredVideo.videoUrl) ||
                                      featuredVideo.videoUrl.startsWith('blob:') ||
                                      featuredVideo.videoUrl.startsWith('data:video/')
                
                if (isNativeVideo) {
                  // Native video element with VideoCover
                  return (
                    <VideoCover
                      aspectRatio={aspectRatio}
                      mediaType="video"
                      sx={{ zIndex: 1 }}
                    >
                      <video
                        ref={videoRef}
                        src={featuredVideo.videoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        onLoadedMetadata={() => {
                          // Update aspect ratio if video metadata loads and differs
                          if (videoRef.current) {
                            const video = videoRef.current
                            if (video.videoWidth && video.videoHeight) {
                              const detectedRatio = video.videoWidth / video.videoHeight
                              if (Math.abs(detectedRatio - aspectRatio) > 0.01) {
                                console.log('[Hero Section] Updating aspect ratio from video metadata:', detectedRatio)
                                setAspectRatio(detectedRatio)
                              }
                            }
                          }
                          setIsVideoPlaying(true)
                        }}
                        onPlay={() => setIsVideoPlaying(true)}
                        style={{
                  width: '100%',
                  height: '100%',
                        }}
                      />
                    </VideoCover>
                  )
                } else {
                  // YouTube and Google Drive videos use iframe with VideoCover
                  return (
                    <VideoCover
                      aspectRatio={aspectRatio}
                      mediaType="iframe"
                      sx={{ zIndex: 1 }}
              >
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
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    pointerEvents: 'none',
                    display: 'block',
                  }}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-read; clipboard-write"
                  allowFullScreen
                  loading="eager"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox allow-autoplay"
                />
                    </VideoCover>
                  )
                }
              })()
            )}
          </>
        )}
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
              src="/FBS%20logo%20acronim.svg"
              alt={t('home.title')}
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
            {t('home.heroTitle')}
            <br />
            <Box component="span" sx={{ color: 'secondary.main' }}>
              {t('home.heroSubtitle')}
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
            {t('home.heroDescription')}
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
              {t('home.exploreProjects')}
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
        aria-label={t('home.scrollDown')}
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
