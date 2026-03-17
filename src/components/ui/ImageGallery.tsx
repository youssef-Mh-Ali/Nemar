import { useState } from 'react'
import { Box, IconButton, Dialog, DialogContent, SwipeableDrawer, useMediaQuery, useTheme } from '@mui/material'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageGalleryProps {
  images: string[]
  initialIndex?: number
  onClose?: () => void
}

export default function ImageGallery({ images, initialIndex = 0, onClose }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(true)

  const handleClose = () => {
    setOpen(false)
    onClose?.()
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setIsZoomed(false)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setIsZoomed(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prevImage()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'Escape') handleClose()
  }

  const content = (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.95)',
        outline: 'none',
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          color: 'white',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
        }}
      >
        <X />
      </IconButton>

      {/* Zoom Toggle */}
      {!isMobile && (
        <IconButton
          onClick={() => setIsZoomed(!isZoomed)}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
          }}
        >
          {isZoomed ? <ZoomOut /> : <ZoomIn />}
        </IconButton>
      )}

      {/* Main Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 80px',
            cursor: isZoomed ? 'zoom-out' : 'zoom-in',
          }}
          onClick={() => !isMobile && setIsZoomed(!isZoomed)}
        >
          <Box
            component="img"
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: isZoomed ? 'scale(2)' : 'scale(1)',
              transition: 'transform 0.3s',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <IconButton
            onClick={prevImage}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
            }}
          >
            <ChevronRight />
          </IconButton>
          <IconButton
            onClick={nextImage}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
            }}
          >
            <ChevronLeft />
          </IconButton>
        </>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            overflowX: 'auto',
            overflowY: 'hidden',
            py: 1,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.3)' },
          }}
        >
          {images.map((img, index) => (
            <Box
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsZoomed(false)
              }}
              sx={{
                width: 80,
                height: 80,
                flexShrink: 0,
                border: currentIndex === index ? '2px solid white' : '2px solid transparent',
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                opacity: currentIndex === index ? 1 : 0.6,
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={img}
                alt={`Thumbnail ${index + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Image Counter */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 110,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          px: 2,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.875rem',
        }}
      >
        {currentIndex + 1} / {images.length}
      </Box>
    </Box>
  )

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={handleClose}
        onOpen={() => {}}
        PaperProps={{
          sx: {
            height: '100vh',
            bgcolor: 'transparent',
          },
        }}
      >
        {content}
      </SwipeableDrawer>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          maxWidth: '100vw',
          maxHeight: '100vh',
          m: 0,
          width: '100vw',
          height: '100vh',
        },
      }}
    >
      <DialogContent sx={{ p: 0, height: '100vh', overflow: 'hidden' }}>{content}</DialogContent>
    </Dialog>
  )
}

