import { useEffect, useState, RefObject } from 'react'

interface CoverScaleResult {
  scale: number
  translateX: number
  translateY: number
}

interface UseCoverScaleOptions {
  aspectRatio: number // Media aspect ratio (width/height)
  objectPosition?: string // CSS object-position format: "center center", "50% 30%", etc.
}

/**
 * Hook that calculates scale and translate values to make media cover a container
 * Similar to CSS `object-fit: cover` but works with transforms for iframes
 * 
 * @param containerRef - Ref to the container element
 * @param options - Options including aspect ratio and object position
 * @returns Scale and translate values for transform
 */
export function useCoverScale(
  containerRef: RefObject<HTMLElement>,
  options: UseCoverScaleOptions
): CoverScaleResult {
  const { aspectRatio, objectPosition = 'center center' } = options
  
  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const calculateScale = () => {
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      
      if (!containerWidth || !containerHeight || !aspectRatio || aspectRatio <= 0) {
        setScale(1)
        setTranslateX(0)
        setTranslateY(0)
        return
      }

      // Base media dimensions: use container height as reference
      // This ensures we have a consistent reference point
      // For landscape media (aspectRatio > 1): base height = container height, base width = height * aspectRatio
      // For portrait media (aspectRatio < 1): base width = container width, base height = width / aspectRatio
      // Actually, simpler: always use container height as reference for base dimensions
      const baseHeight = containerHeight
      const baseWidth = baseHeight * aspectRatio
      
      // Calculate scale needed to cover container
      // Scale by width: if scaled width >= container width, we cover horizontally
      // Scale by height: if scaled height >= container height, we cover vertically
      // We need both, so use the larger scale
      const scaleX = containerWidth / baseWidth
      const scaleY = containerHeight / baseHeight
      
      // Use the larger scale to ensure coverage (cover behavior)
      const newScale = Math.max(scaleX, scaleY)

      // Calculate actual dimensions after scaling
      const scaledWidth = baseWidth * newScale
      const scaledHeight = baseHeight * newScale

      // Parse object-position (default: "center center")
      // Handle both "50%" and "50" formats, and keywords like "center"
      const positionParts = objectPosition.split(/\s+/)
      let xPercent = 50
      let yPercent = 50
      
      if (positionParts.length >= 1) {
        const xValue = positionParts[0]
        if (xValue === 'left') xPercent = 0
        else if (xValue === 'right') xPercent = 100
        else if (xValue === 'center') xPercent = 50
        else {
          const parsed = parseFloat(xValue.replace('%', ''))
          if (!isNaN(parsed)) xPercent = parsed
        }
      }
      
      if (positionParts.length >= 2) {
        const yValue = positionParts[1]
        if (yValue === 'top') yPercent = 0
        else if (yValue === 'bottom') yPercent = 100
        else if (yValue === 'center') yPercent = 50
        else {
          const parsed = parseFloat(yValue.replace('%', ''))
          if (!isNaN(parsed)) yPercent = parsed
        }
      }

      // Calculate excess (how much the scaled media exceeds the container)
      const excessWidth = scaledWidth - containerWidth
      const excessHeight = scaledHeight - containerHeight

      // Convert percentage to decimal (50% = 0.5)
      const xPosition = xPercent / 100
      const yPosition = yPercent / 100

      // Calculate translate values to position the media
      // Negative values move content left/up, positive moves right/down
      // We want to position based on the excess and the object-position
      const newTranslateX = -excessWidth * xPosition
      const newTranslateY = -excessHeight * yPosition

      setScale(newScale)
      setTranslateX(newTranslateX)
      setTranslateY(newTranslateY)
    }

    // Calculate initial scale
    calculateScale()

    // Use ResizeObserver to recalculate on container size changes
    const resizeObserver = new ResizeObserver(() => {
      calculateScale()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef, aspectRatio, objectPosition])

  return { scale, translateX, translateY }
}

