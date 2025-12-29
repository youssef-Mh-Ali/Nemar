import { useState, useRef, useEffect } from 'react'
import { Box, IconButton, Paper, Typography, Button } from '@mui/material'
import { X, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VirtualTourProps {
  images: string[]
  isOpen: boolean
  onClose: () => void
}

export default function VirtualTour({ images, isOpen, onClose }: VirtualTourProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setZoom(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(Math.max(1, Math.min(3, zoom + delta)))
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const resetView = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          bgcolor: 'rgba(0, 0, 0, 0.95)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.95)',
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={onClose}
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
            <X size={24} />
          </IconButton>

          {/* Controls */}
          <Paper
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 10,
              p: 1,
              display: 'flex',
              gap: 0.5,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <IconButton
              onClick={() => setZoom(Math.min(3, zoom + 0.2))}
              size="small"
              sx={{ color: 'white' }}
            >
              <ZoomIn size={20} />
            </IconButton>
            <IconButton
              onClick={() => setZoom(Math.max(1, zoom - 0.2))}
              size="small"
              sx={{ color: 'white' }}
            >
              <ZoomOut size={20} />
            </IconButton>
            <IconButton onClick={() => setRotation((prev) => prev + 90)} size="small" sx={{ color: 'white' }}>
              <RotateCw size={20} />
            </IconButton>
            <IconButton onClick={resetView} size="small" sx={{ color: 'white' }}>
              <Maximize2 size={20} />
            </IconButton>
          </Paper>

          {/* Image Container */}
          <Box
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{
                scale: zoom,
                rotate: rotation,
                x: position.x,
                y: position.y,
              }}
              transition={{ duration: 0.2 }}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              <Box
                component="img"
                src={images[currentImageIndex]}
                alt={`Virtual Tour ${currentImageIndex + 1}`}
                sx={{
                  maxWidth: '100vw',
                  maxHeight: '100vh',
                  objectFit: 'contain',
                  userSelect: 'none',
                }}
                draggable={false}
              />
            </motion.div>
          </Box>

          {/* Navigation */}
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
                <X size={24} style={{ transform: 'rotate(180deg)' }} />
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
                <X size={24} />
              </IconButton>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <Paper
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                px: 2,
                py: 1,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
              }}
            >
              <Typography variant="body2">
                {currentImageIndex + 1} / {images.length}
              </Typography>
            </Paper>
          )}

          {/* Instructions */}
          <Paper
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 10,
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              maxWidth: 300,
            }}
          >
            <Typography variant="caption" display="block" gutterBottom>
              استخدم عجلة الماوس للتصغير/التكبير
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              اسحب للتنقل عند التكبير
            </Typography>
            <Typography variant="caption" display="block">
              اضغط على زر الدوران لتدوير الصورة
            </Typography>
          </Paper>
        </Box>
      </motion.div>
    </AnimatePresence>
  )
}

