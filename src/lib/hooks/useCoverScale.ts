import { useEffect, useState, RefObject } from 'react'

interface CoverScaleResult {
  scale: number
  translateX: number
  translateY: number
  baseWidth: number
  baseHeight: number
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
  const [baseWidth, setBaseWidth] = useState(0)
  const [baseHeight, setBaseHeight] = useState(0)

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
        setBaseWidth(containerWidth || 0)
        setBaseHeight(containerHeight || 0)
        return
      }

      // Calculate the container aspect ratio
      const containerAspectRatio = containerWidth / containerHeight
      
      // Determine base dimensions based on media and container aspect ratios
      // If media is wider than container (landscape media in portrait container):
      //   - Scale by height to ensure height covers
      // If media is taller than container (portrait media in landscape container):
      //   - Scale by width to ensure width covers
      
      let baseWidth: number
      let baseHeight: number
      
      if (aspectRatio > containerAspectRatio) {
        // Media is wider relative to container - scale by height
        baseHeight = containerHeight
        baseWidth = baseHeight * aspectRatio
      } else {
        // Media is taller relative to container - scale by width
        baseWidth = containerWidth
        baseHeight = baseWidth / aspectRatio
      }
      
      // Calculate scale needed to cover container
      // We need to ensure both width and height cover, so use the larger scale
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
      setBaseWidth(baseWidth)
      setBaseHeight(baseHeight)
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

  return { scale, translateX, translateY, baseWidth, baseHeight }
}

