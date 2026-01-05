import { useState, useEffect } from 'react'
import { Box, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageCarouselProps {
  images: string[]
  height?: string | number | { xs?: string | number; md?: string | number }
  showDots?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

export default function ImageCarousel({
  images,
  height = { xs: '50vh', md: '60vh' },
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 5000,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, autoPlayInterval)
      return () => clearInterval(interval)
    }
  }, [autoPlay, autoPlayInterval, images.length])

  if (images.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        borderRadius: { xs: 0, md: 2 },
        bgcolor: 'grey.100',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        >
          <Box
            component="img"
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            sx={{
              position: 'absolute',
              left: { xs: 12, md: 24 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
                transform: 'translateY(-50%) scale(1.1)',
              },
              zIndex: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ChevronLeft sx={{ fontSize: { xs: 28, md: 32 } }} />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            sx={{
              position: 'absolute',
              right: { xs: 12, md: 24 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
                transform: 'translateY(-50%) scale(1.1)',
              },
              zIndex: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ChevronRight sx={{ fontSize: { xs: 28, md: 32 } }} />
          </IconButton>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && images.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 20, md: 24 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1.5,
            zIndex: 3,
            alignItems: 'center',
          }}
        >
          {images.map((_, index) => (
            <Box
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                goToImage(index)
              }}
              sx={{
                width: currentIndex === index ? 32 : 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: currentIndex === index ? 'white' : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                boxShadow: currentIndex === index ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  transform: 'scale(1.2)',
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 16, md: 20 },
            right: { xs: 16, md: 20 },
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            px: 2,
            py: 0.75,
            borderRadius: 2,
            fontSize: { xs: '0.75rem', md: '0.875rem' },
            fontWeight: 500,
            zIndex: 3,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          {currentIndex + 1} / {images.length}
        </Box>
      )}
    </Box>
  )
}

