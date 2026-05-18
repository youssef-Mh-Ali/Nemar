import { useEffect, useState, useRef } from 'react'
import { Box, Container, Typography, Grid } from '@mui/material'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getFeaturedVideo, detectVideoAspectRatio } from '../../lib/api-client'
import VideoCover from './VideoCover'

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
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 5)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function loadFeaturedVideo() {
      try {
        const response = await getFeaturedVideo()
        if (response.success && response.data) {
          if (response.data.videoUrl) {
            let finalAspectRatio = response.data.aspectRatio
            if (finalAspectRatio) {
              setAspectRatio(finalAspectRatio)
            } else {
              const isNativeVideo = /\.(mp4|webm|ogg|m3u8|mov|avi)(\?|$)/i.test(response.data.videoUrl) ||
                                    response.data.videoUrl.startsWith('blob:') ||
                                    response.data.videoUrl.startsWith('data:video/')
              if (isNativeVideo) {
                try {
                  const detectedRatio = await detectVideoAspectRatio(response.data.videoUrl)
                  if (detectedRatio) {
                    finalAspectRatio = detectedRatio
                    setAspectRatio(detectedRatio)
                  }
                } catch (error) {
                  setAspectRatio(4 / 5)
                }
              } else {
                if (response.data.videoUrl.includes('instagram.com/reel/')) {
                  setAspectRatio(9 / 16)
                } else if (response.data.videoUrl.includes('instagram.com/p/')) {
                  setAspectRatio(1)
                } else {
                  setAspectRatio(4 / 5)
                }
              }
            }
            setFeaturedVideo({ ...response.data, aspectRatio: finalAspectRatio })
            setIsVideoPlaying(true)
          }
        }
      } catch (error) {
        console.error('Error loading featured video:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadFeaturedVideo()
  }, [])

  useEffect(() => {
    if (featuredVideo?.videoUrl?.includes('instagram.com')) {
      setInstagramEmbedFailed(false)
      if (window.instgrm) {
        window.instgrm.Embeds.process()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      script.onload = () => {
        setTimeout(() => {
          if (window.instgrm) {
            window.instgrm.Embeds.process()
          } else {
            setInstagramEmbedFailed(true)
          }
        }, 100)
      }
      script.onerror = () => setInstagramEmbedFailed(true)
      const timeout = setTimeout(() => {
        if (!window.instgrm) setInstagramEmbedFailed(true)
      }, 3000)
      document.body.appendChild(script)
      return () => {
        clearTimeout(timeout)
        const existingScript = document.querySelector('script[src="https://www.instagram.com/embed.js"]')
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript)
        }
      }
    }
  }, [featuredVideo])

  const scrollToProjects = () => {
    const target = document.getElementById('inspiring-spaces')
    if (!target) return
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    const duration = 1500 // 1.5 seconds slow animated scroll
    let start: number | null = null

    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime
      const timeElapsed = currentTime - start
      const progress = Math.min(timeElapsed / duration, 1)
      const ease = easeInOutCubic(progress)
      window.scrollTo(0, startPosition + distance * ease)
      if (timeElapsed < duration) {
        requestAnimationFrame(animation)
      }
    }
    requestAnimationFrame(animation)
  }

  const renderVideo = () => {
    if (!featuredVideo || !featuredVideo.videoUrl || isLoading) {
      return (
        <VideoCover aspectRatio={aspectRatio} mediaType="video">
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: featuredVideo?.coverImageUrl 
                ? `url(${featuredVideo.coverImageUrl}) center/cover` 
                : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </VideoCover>
      )
    }

    if (featuredVideo.videoUrl.includes('instagram.com')) {
      if (instagramEmbedFailed) {
        return (
          <Box
            component="a"
            href={featuredVideo.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              background: featuredVideo.coverImageUrl ? `url(${featuredVideo.coverImageUrl})` : '#e2e8f0',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center', color: 'white', p: 2, bgcolor: 'rgba(0, 0, 0, 0.5)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
              <Typography variant="body1" fontWeight="bold">{t('home.watchOnInstagram', 'Watch video on Instagram')}</Typography>
            </Box>
          </Box>
        )
      }
      return (
        <VideoCover aspectRatio={aspectRatio} mediaType="instagram">
          <Box
            component="blockquote"
            className="instagram-media"
            data-instgrm-permalink={featuredVideo.videoUrl}
            data-instgrm-version="14"
            sx={{ width: '100%', height: '100%', m: 0, p: 0, display: 'block', '& iframe': { width: '100% !important', height: '100% !important', border: 'none' } }}
          />
        </VideoCover>
      )
    }

    const isNativeVideo = /\.(mp4|webm|ogg|m3u8|mov|avi)(\?|$)/i.test(featuredVideo.videoUrl) ||
                          featuredVideo.videoUrl.startsWith('blob:') ||
                          featuredVideo.videoUrl.startsWith('data:video/')
    
    if (isNativeVideo) {
      return (
        <VideoCover aspectRatio={aspectRatio} mediaType="video">
          <video
            ref={videoRef}
            src={featuredVideo.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            onLoadedMetadata={() => {
              if (videoRef.current && videoRef.current.videoWidth && videoRef.current.videoHeight) {
                const detectedRatio = videoRef.current.videoWidth / videoRef.current.videoHeight
                if (Math.abs(detectedRatio - aspectRatio) > 0.01) {
                  setAspectRatio(detectedRatio)
                }
              }
              setIsVideoPlaying(true)
            }}
            onPlay={() => setIsVideoPlaying(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </VideoCover>
      )
    }

    return (
      <VideoCover aspectRatio={aspectRatio} mediaType="iframe">
        <Box
          component="iframe"
          src={featuredVideo.videoUrl.trim()}
          onLoad={() => setIsVideoPlaying(true)}
          sx={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none', display: 'block' }}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="eager"
        />
      </VideoCover>
    )
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', pt: { xs: 10, md: 12 }, pb: { xs: 8, md: 4 } }}>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, px: { xs: 2, md: 4, lg: 6 }, height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
        
        <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', my: { xs: 8, md: 10 } }}>
          
          {/* Center Square Video */}
          <Box sx={{ width: { xs: '100%', sm: '80%', md: '500px', lg: '600px' }, aspectRatio: '1/1', position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: 'easeOut' }} style={{ width: '100%', height: '100%' }}>
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: 0, // Sharp corners
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  position: 'relative',
                  bgcolor: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& > *': { width: '100%', height: '100%' }
                }}
              >
                {!featuredVideo || !featuredVideo.videoUrl || isLoading ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: featuredVideo?.coverImageUrl 
                        ? `url(${featuredVideo.coverImageUrl}) center/cover` 
                        : 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop") center/cover',
                    }}
                  />
                ) : (
                  renderVideo()
                )}
              </Box>
            </motion.div>
          </Box>

          {/* Overlapping Main Title (Absolute to left) */}
          <Box sx={{ position: 'absolute', left: { xs: 0, md: '2%', lg: '5%' }, top: { xs: '-60px', md: '45%' }, transform: { xs: 'none', md: 'translateY(-50%)' }, zIndex: 10, pointerEvents: 'none', maxWidth: { xs: '100%', md: '650px', lg: '800px' } }}>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem', lg: '7rem' },
                  fontWeight: 400,
                  color: '#102d4a',
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  textShadow: '0 4px 30px rgba(255,255,255,0.7)',
                }}
              >
                {t('home.heroTitle')}<br />{t('home.heroSubtitle')}
              </Typography>
            </motion.div>
          </Box>

          {/* Overlapping Description (Absolute to right bottom) */}
          <Box sx={{ position: 'absolute', right: { xs: 0, md: '2%', lg: '5%' }, bottom: { xs: '-100px', md: '10%' }, zIndex: 10, maxWidth: { xs: '100%', sm: '80%', md: '320px', lg: '380px' }, textAlign: { xs: 'center', md: 'left' } }}>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}>
              <Typography
                variant="body1"
                sx={{
                  color: '#102d4a',
                  fontWeight: 500,
                  lineHeight: 1.5,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  textShadow: '0 2px 15px rgba(255,255,255,0.8)',
                }}
              >
                {t('home.heroDescription')}
              </Typography>
            </motion.div>
          </Box>
        </Box>

        {/* Scroll Down Section */}
        <Box sx={{ position: 'absolute', bottom: { xs: 10, md: 30 }, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#102d4a' }} onClick={scrollToProjects}>
            <Typography variant="body2" fontWeight="500" sx={{ letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 1 }}>
              <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ display: 'inline-block' }}>
                &darr;
              </motion.span>
              {t('home.scrollDown', 'Scroll down')}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
