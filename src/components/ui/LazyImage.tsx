import { useState, useRef, useEffect } from 'react'
import { Box, Skeleton } from '@mui/material'
import { useInView } from 'react-intersection-observer'

interface LazyImageProps {
  src: string
  alt: string
  placeholder?: string
  className?: string
  sx?: any
  aspectRatio?: number
  objectFit?: 'cover' | 'contain' | 'fill'
}

export default function LazyImage({
  src,
  alt,
  placeholder,
  className,
  sx,
  aspectRatio,
  objectFit = 'cover',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        ...(aspectRatio && {
          paddingTop: `${(1 / aspectRatio) * 100}%`,
        }),
        ...sx,
      }}
      className={className}
    >
      {!inView && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      )}

      {inView && (
        <>
          {!isLoaded && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          )}

          {hasError ? (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                color: 'text.secondary',
              }}
            >
              {alt}
            </Box>
          ) : (
            <Box
              component="img"
              src={src}
              alt={alt}
              onLoad={handleLoad}
              onError={handleError}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit,
                opacity: isLoaded ? 1 : 0,
                transition: 'opacity 0.3s',
              }}
            />
          )}
        </>
      )}
    </Box>
  )
}

