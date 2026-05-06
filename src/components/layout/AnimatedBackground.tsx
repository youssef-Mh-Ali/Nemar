import { motion } from 'framer-motion'
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'

const auroraColors = [
  'hsl(var(--aurora-1))',
  'hsl(var(--aurora-2))',
  'hsl(var(--aurora-3))',
  'hsl(var(--aurora-4))',
]

interface AnimatedBackgroundProps {
  variant?: 'blobs' | 'geometric'
}

export default function AnimatedBackground({ variant = 'blobs' }: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: -10,
        overflow: 'hidden',
        perspective: '1000px',
        background: variant === 'geometric' 
          ? 'linear-gradient(to bottom, #ffffff, #f0f4f8)' 
          : 'linear-gradient(to bottom right, hsl(var(--background)), #ffffff)',
      }}
    >
      {variant === 'geometric' ? (
        // Geometric Variant
        Array.from({ length: 6 }).map((_, i) => {
          const width = 300 + Math.random() * 400
          const height = 300 + Math.random() * 400
          return (
            <motion.div
              key={`geo-${i}`}
              animate={{
                x: [`${Math.random() * 100 - 20}vw`, `${Math.random() * 100 - 20}vw`],
                y: [`${Math.random() * 100 - 20}vh`, `${Math.random() * 100 - 20}vh`],
                rotate: [Math.random() * 45, Math.random() * 90 - 45],
              }}
              transition={{
                duration: 40 + Math.random() * 30,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                width,
                height,
                background: `linear-gradient(135deg, ${auroraColors[i % auroraColors.length]}22, ${auroraColors[(i + 1) % auroraColors.length]}66)`,
                backdropFilter: 'blur(10px)',
                clipPath: 'polygon(10% 0, 100% 10%, 90% 100%, 0 90%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            />
          )
        })
      ) : (
        // Blobs Variant
        Array.from({ length: 6 }).map((_, i) => {
          const size = 300 + Math.random() * 200
          return (
            <motion.div
              key={`blob-${i}`}
              animate={{
                x: [`${Math.random() * 100 - 20}vw`, `${Math.random() * 100 - 20}vw`, `${Math.random() * 100 - 20}vw`],
                y: [`${Math.random() * 100 - 20}vh`, `${Math.random() * 100 - 20}vh`, `${Math.random() * 100 - 20}vh`],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
                borderRadius: ['30%', '50%', '40%'],
              }}
              transition={{
                duration: 25 + Math.random() * 15,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                background: auroraColors[i % auroraColors.length],
                opacity: 0.5,
                filter: 'blur(80px)',
                mixBlendMode: 'multiply',
              }}
            />
          )
        })
      )}
    </Box>
  )
}
