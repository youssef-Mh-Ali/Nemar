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
  const { scale, translateX, translateY } = useCoverScale(containerRef, {
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
  // Base dimensions: the hook uses container height as reference
  // So we set height to 100% and width to height * aspectRatio
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
          // Base dimensions: height matches container, width = height * aspectRatio
          // The hook will scale these to cover
          height: '100%',
          width: `${aspectRatio * 100}%`,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

