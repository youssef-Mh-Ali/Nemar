import { useEffect, useState, useRef } from 'react'
import { Box, Container, Typography, Card, CardContent, Chip, Grid, Skeleton, IconButton } from '@mui/material'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getProjects } from '../../lib/api-client'
import type { Project } from '../../lib/types'
import LazyImage from '../ui/LazyImage'

interface ProjectWithAvailability extends Project {
  hasAvailability: boolean
  availablePhasesCount?: number
}

export default function AboutProjectsSection() {
  const { t, i18n } = useTranslation()
  const [projects, setProjects] = useState<ProjectWithAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await getProjects()
        if (response.success && response.data) {
          setProjects(
            response.data.filter(
              (project) =>
                project.hasAvailability || (project.availablePhasesCount ?? 0) > 0
            )
          )
        }
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProjects()
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const isRtl = i18n.language === 'ar'

  return (
    <Box sx={{ py: 10, px: { xs: 2, md: 3 }, bgcolor: 'rgba(215, 235, 245, 0.4)', position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4} alignItems="center">
          
          {/* Left Side: Title */}
          <Grid item xs={12} md={4} lg={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h2"
                fontWeight="500"
                color="primary.main"
                sx={{
                  lineHeight: 1.1,
                  mb: 4,
                  fontSize: { xs: '3rem', md: '3.5rem', lg: '4rem' }
                }}
              >
                {isRtl ? 'عن مشاريعنا' : 'About\nOur Projects'}
              </Typography>
              
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                <IconButton onClick={() => scroll(isRtl ? 'right' : 'left')} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } }}>
                  {isRtl ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
                <IconButton onClick={() => scroll(isRtl ? 'left' : 'right')} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } }}>
                  {isRtl ? <ChevronLeft /> : <ChevronRight />}
                </IconButton>
              </Box>
            </motion.div>
          </Grid>

          {/* Right Side: Horizontal Carousel */}
          <Grid item xs={12} md={8} lg={9}>
            {isLoading ? (
              <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2 }}>
                {[1, 2, 3].map((i) => (
                  <Card key={i} sx={{ minWidth: 300, flexShrink: 0, borderRadius: 3 }}>
                    <Skeleton variant="rectangular" height={250} />
                    <CardContent>
                      <Skeleton height={24} width="70%" sx={{ mb: 1 }} />
                      <Skeleton height={16} width="50%" />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box
                ref={scrollContainerRef}
                sx={{
                  display: 'flex',
                  gap: 3,
                  overflowX: 'auto',
                  pb: 4,
                  px: 1,
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none', // Firefox
                  '&::-webkit-scrollbar': {
                    display: 'none' // Chrome/Safari
                  }
                }}
              >
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <Card
                      component={Link}
                      to={`/project/${project.id}`}
                      sx={{
                        width: { xs: 280, sm: 320, md: 350 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        textDecoration: 'none',
                        borderRadius: 0,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 12,
                        },
                      }}
                    >
                      <Box sx={{ position: 'relative', height: { xs: 280, md: 350 }, overflow: 'hidden' }}>
                        <LazyImage
                          src={project.coverImageUrl}
                          alt={isRtl ? project.nameAr : project.nameEn}
                          objectFit="cover"
                          sx={{
                            height: '100%',
                            transition: 'transform 0.5s',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            },
                          }}
                        />
                        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, alignItems: 'center', zIndex: 10 }}>
                          {project.logoUrl && (
                            <Box 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                bgcolor: 'white', 
                                borderRadius: 1.5, 
                                p: 0.5, 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)' 
                              }}
                            >
                              <Box component="img" src={project.logoUrl} alt="Logo" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                          )}
                          <Chip
                            label={
                              project.hasAvailability
                                ? t('home.phasesAvailable', { count: project.availablePhasesCount })
                                : t('home.soldOut')
                            }
                            color={project.hasAvailability ? 'success' : 'error'}
                            size="small"
                            sx={{
                              backdropFilter: 'blur(4px)',
                              bgcolor: project.hasAvailability ? 'rgba(46, 125, 50, 0.8)' : 'rgba(211, 47, 47, 0.8)',
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                          }}
                        />
                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', p: 3, color: 'white' }}>
                          <Typography variant="h5" fontWeight="500" gutterBottom>
                            {isRtl ? project.nameAr : project.nameEn}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.9 }}>
                            <MapPin size={16} />
                            <Typography variant="body2">{isRtl ? project.locationAr : project.locationEn}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            )}
            
            {/* Mobile Navigation Arrows */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 2, justifyContent: 'center', mt: 2 }}>
                <IconButton onClick={() => scroll(isRtl ? 'right' : 'left')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                  {isRtl ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
                <IconButton onClick={() => scroll(isRtl ? 'left' : 'right')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
                  {isRtl ? <ChevronLeft /> : <ChevronRight />}
                </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
