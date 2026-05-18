import { Box } from '@mui/material'
import { motion } from 'framer-motion'

interface GlassVolumeProps {
  size: number
  x: string | number
  y: string | number
  delay?: number
  duration?: number
  color?: string
}

const GlassCube = ({ size, x, y, delay = 0, duration = 20, color = 'rgba(255, 255, 255, 0.15)' }: GlassVolumeProps) => {
  const hs = size / 2
  const faceStyle = {
    position: 'absolute' as const,
    width: size,
    height: size,
    background: color,
    border: '1px solid rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(12px)',
    boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.3)',
    borderRadius: '2px',
  }

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        transformStyle: 'preserve-3d',
      }}
      initial={{ rotateX: 0, rotateY: 0, rotateZ: 0 }}
      animate={{
        rotateX: [0, 360],
        rotateY: [0, 360],
        rotateZ: [0, 180],
        y: [0, -30, 0]
      }}
      transition={{
        rotateX: { repeat: Infinity, duration, ease: 'linear', delay },
        rotateY: { repeat: Infinity, duration: duration * 1.2, ease: 'linear', delay },
        rotateZ: { repeat: Infinity, duration: duration * 1.5, ease: 'linear', delay },
        y: { repeat: Infinity, duration: duration * 0.5, ease: 'easeInOut', delay }
      }}
    >
      {/* Front */}
      <div style={{ ...faceStyle, transform: `translateZ(${hs}px)` }} />
      {/* Back */}
      <div style={{ ...faceStyle, transform: `rotateY(180deg) translateZ(${hs}px)` }} />
      {/* Right */}
      <div style={{ ...faceStyle, transform: `rotateY(90deg) translateZ(${hs}px)` }} />
      {/* Left */}
      <div style={{ ...faceStyle, transform: `rotateY(-90deg) translateZ(${hs}px)` }} />
      {/* Top */}
      <div style={{ ...faceStyle, transform: `rotateX(90deg) translateZ(${hs}px)` }} />
      {/* Bottom */}
      <div style={{ ...faceStyle, transform: `rotateX(-90deg) translateZ(${hs}px)` }} />
    </motion.div>
  )
}

export default function FBSVolumesBackground() {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        // Soft blue matching the Solid Volumes aesthetic
        background: 'linear-gradient(135deg, #81afd2 0%, #5d8eaf 100%)',
        perspective: '1200px',
      }}
    >
      {/* Lighting highlight overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Floating 3D Solid Volumes */}
      <GlassCube size={120} x="10%" y="15%" duration={25} delay={0} />
      <GlassCube size={85} x="75%" y="10%" duration={18} delay={2} />
      <GlassCube size={160} x="80%" y="55%" duration={32} delay={1} />
      <GlassCube size={100} x="15%" y="65%" duration={22} delay={3} />
      <GlassCube size={140} x="45%" y="35%" duration={38} delay={0.5} />
      <GlassCube size={70} x="30%" y="80%" duration={15} delay={1.5} />
      <GlassCube size={95} x="65%" y="80%" duration={28} delay={2.5} />
      <GlassCube size={110} x="40%" y="5%" duration={20} delay={4} />
      <GlassCube size={60} x="5%" y="45%" duration={16} delay={1} />
      <GlassCube size={130} x="90%" y="25%" duration={26} delay={3.5} />
    </Box>
  )
}
