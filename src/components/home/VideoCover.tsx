import { useRef, ReactNode, cloneElement, isValidElement } from 'react'
import { Box, BoxProps } from '@mui/material'
import { useCoverScale } from '../../lib/hooks/useCoverScale'

interface VideoCoverProps extends Omit<BoxProps, 'children'> {
  aspectRatio: number // Media aspect ratio (width/height)
  objectPosition?: string // CSS object-position format: "center center", "50% 30%", etc.
  mediaType: 'video' | 'iframe' | 'instagram'
  children: ReactNode
}

/**
 * Component that wraps media (video/iframe) with cover behavior
 * For native <video>: uses CSS object-fit: cover
 * For <iframe>: uses ResizeObserver-based transform scaling
 */
export default function VideoCover({
  aspectRatio,
  objectPosition = 'center center',
  mediaType,
  children,
  sx,
  ...boxProps
}: VideoCoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scale, translateX, translateY, baseWidth, baseHeight } = useCoverScale(containerRef, {
    aspectRatio,
    objectPosition,
  })

  // For native video elements, use CSS object-fit (more performant)
  if (mediaType === 'video' && isValidElement(children)) {
    return (
      <Box
        ref={containerRef}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          ...sx,
        }}
        {...boxProps}
      >
        {cloneElement(children as React.ReactElement<any>, {
          style: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: objectPosition,
            ...(children.props?.style || {}),
          },
        })}
      </Box>
    )
  }

  // For iframes (YouTube, Google Drive, etc.), use transform scaling
  // For Instagram embeds, also use transform scaling on the wrapper
  // The hook calculates base dimensions internally, so we set dimensions that will be scaled
  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...sx,
      }}
      {...boxProps}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${scale})`,
          transformOrigin: 'center center',
          // Use calculated base dimensions from the hook
          // If base dimensions aren't ready yet, use aspect ratio-based fallback
          width: baseWidth > 0 ? `${baseWidth}px` : aspectRatio >= 1 ? `${100 * aspectRatio}vh` : '100vw',
          height: baseHeight > 0 ? `${baseHeight}px` : aspectRatio <= 1 ? `${100 / aspectRatio}vw` : '100vh',
          // Ensure children fill the container
          '& > *': {
            width: '100% !important',
            height: '100% !important',
            display: 'block',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

