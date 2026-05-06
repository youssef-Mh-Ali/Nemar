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
        Array.from({ length: 8 }).map((_, i) => {
          const width = 300 + Math.random() * 500
          const height = 300 + Math.random() * 500
          return (
            <motion.div
              key={`geo-${i}`}
              animate={{
                x: [`${Math.random() * 100 - 20}vw`, `${Math.random() * 100 - 20}vw`],
                y: [`${Math.random() * 100 - 20}vh`, `${Math.random() * 100 - 20}vh`],
                rotateX: [Math.random() * 90 - 45, Math.random() * 360],
                rotateY: [Math.random() * 90 - 45, Math.random() * 360],
                rotateZ: [Math.random() * 90 - 45, Math.random() * 360],
              }}
              transition={{
                duration: 50 + Math.random() * 40,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                width,
                height,
                transformStyle: 'preserve-3d',
              }}
            >
              {[
                { transform: `rotateY(0deg) translateZ(${width / 2}px)`, brightness: 1 },
                { transform: `rotateY(90deg) translateZ(${width / 2}px)`, brightness: 0.8 },
                { transform: `rotateY(180deg) translateZ(${width / 2}px)`, brightness: 0.6 },
                { transform: `rotateY(-90deg) translateZ(${width / 2}px)`, brightness: 0.7 },
                { transform: `rotateX(90deg) translateZ(${width / 2}px)`, brightness: 1.1 },
                { transform: `rotateX(-90deg) translateZ(${width / 2}px)`, brightness: 0.5 },
              ].map((face, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: auroraColors[i % auroraColors.length],
                    opacity: 0.7,
                    filter: `brightness(${face.brightness})`,
                    transform: face.transform,
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(4px)',
                    boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </motion.div>
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
