import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowRight, Construction } from 'lucide-react'
import { useAppStore } from '../lib/store/app-store'

export default function ComingSoon() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const { authorizeMaintenance } = useAppStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = authorizeMaintenance(password)
    if (!success) {
      setError(true)
      setTimeout(() => setError(false), 3000)
    }
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        backgroundImage: 'url("/images/coming-soon-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 31, 58, 0.85)', // Dark primary color with overlay
          backdropFilter: 'blur(8px)',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              mb: 4,
            }}
          >
            <motion.img
              src="/BinSaedanLogo-White.png"
              alt="Bin Saedan"
              style={{ height: '80px', marginBottom: '32px' }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />

            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontFamily: '"IBM Plex Sans Arabic", sans-serif',
              }}
            >
              قريباً
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: '#c9a227', // Gold color
                fontWeight: 500,
                mb: 4,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Coming Soon
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 6,
                maxWidth: '400px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              نحن نعمل على تطوير تجربة عقارية رقمية استثنائية تليق بكم.
              <br />
              We are working on developing an exceptional digital real estate experience for you.
            </Typography>
          </Box>

          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <form onSubmit={handleSubmit}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'white',
                  mb: 2,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Lock size={16} /> Enter Access Password
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={error}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#c9a227',
                      },
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    borderRadius: '12px',
                    px: 3,
                    bgcolor: '#c9a227',
                    '&:hover': { bgcolor: '#a8871f' },
                  }}
                >
                  <ArrowRight size={24} />
                </Button>
              </Box>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert
                      severity="error"
                      sx={{
                        mt: 2,
                        borderRadius: '12px',
                        bgcolor: 'rgba(211, 47, 47, 0.1)',
                        color: '#ffcdd2',
                        '& .MuiAlert-icon': { color: '#ffcdd2' },
                      }}
                    >
                      Incorrect password. Please try again.
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Paper>

          <Box
            sx={{
              mt: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            <Construction size={16} />
            <Typography variant="caption">Under Development by Bin Saedan Team</Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}
