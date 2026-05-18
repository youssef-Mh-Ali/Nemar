import { useEffect, useState } from 'react'
import { Container, Typography, Box, Grid, Card, CardContent, CircularProgress, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getProjects } from '../lib/api-client'
import type { Project } from '../lib/types'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function ProjectCarousel({ project }: { project: Project }) {
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [currentIndex, setCurrentIndex] = useState(0)

  // Collect images from coverImageUrl and attachments
  const images = [
    project.coverImageUrl,
    ...(project.attachments?.filter(a => a.fileType?.startsWith('image/') || a.url.match(/\.(jpeg|jpg|gif|png)$/i)).map(a => a.url) || [])
  ].filter(Boolean)

  if (images.length === 0) {
    return (
      <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No images available</Typography>
      </Box>
    )
  }

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
      <Box
        component="img"
        src={images[currentIndex]}
        alt="Project Image"
        sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
      />
      {images.length > 1 && (
        <>
          <Box sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', zIndex: 2 }}>
            <Button
              onClick={isRtl ? nextSlide : prevSlide}
              sx={{ minWidth: 0, p: 1, bgcolor: 'rgba(255,255,255,0.8)', color: 'primary.main', '&:hover': { bgcolor: 'white' }, borderRadius: '50%' }}
            >
              {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </Button>
          </Box>
          <Box sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', zIndex: 2 }}>
            <Button
              onClick={isRtl ? prevSlide : nextSlide}
              sx={{ minWidth: 0, p: 1, bgcolor: 'rgba(255,255,255,0.8)', color: 'primary.main', '&:hover': { bgcolor: 'white' }, borderRadius: '50%' }}
            >
              {isRtl ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
            </Button>
          </Box>
          <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 1 }}>
            {images.map((_, i) => (
              <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === currentIndex ? 'primary.main' : 'rgba(255,255,255,0.6)', transition: 'background-color 0.2s' }} />
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}

export default function LatestReleases() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRtl = i18n.language === 'ar'
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await getProjects()
        if (res.success && res.data) {
          setProjects(res.data)
        }
      } catch (err) {
        console.error('Failed to load projects', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProjects()
  }, [])

  return (
    <Box sx={{ py: { xs: 12, md: 16 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Container maxWidth="xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 600, color: 'primary.main', mb: 2, textAlign: isRtl ? 'right' : 'left' }}>
            {t('latestReleases', 'Our Latest Releases')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 8, maxWidth: '800px', textAlign: isRtl ? 'right' : 'left', fontSize: '1.1rem' }}>
            {isRtl 
              ? 'اكتشف أحدث مشاريعنا العقارية المصممة لتلبية تطلعاتك بأعلى معايير الجودة والابتكار.' 
              : 'Discover our latest real estate projects designed to meet your aspirations with the highest standards of quality and innovation.'}
          </Typography>
        </motion.div>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {projects.map((project, index) => (
              <Grid item xs={12} md={6} lg={4} key={project.id}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} style={{ height: '100%' }}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      cursor: 'pointer',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                      }
                    }}
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <ProjectCarousel project={project} />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, color: 'primary.main' }}>
                          {isRtl ? project.nameAr : project.name}
                        </Typography>
                        {project.logoUrl && (
                          <Box component="img" src={project.logoUrl} alt="Logo" sx={{ height: 32, objectFit: 'contain', ml: 2 }} />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {isRtl ? project.locationAr : project.location}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {isRtl ? project.descriptionAr : project.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  )
}
