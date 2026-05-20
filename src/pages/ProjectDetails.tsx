import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Link as MuiLink,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { ArrowRight, FileText, Image as ImageIcon, ExternalLink, MapPin, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { getProject } from '../lib/api-client'
import type { Project, ProjectAttachment, ProjectNote } from '../lib/types'
import OpenStreetProjectMap from '../components/ui/OpenStreetProjectMap'
import RegisterInterestModal from '../components/home/RegisterInterestModal'
import NearbyAmenities from '../components/project/NearbyAmenities'
import ProjectBrochureViewer from '../components/project/ProjectBrochureViewer'
import CircularGallery from '../components/reactbits/CircularGallery'
import ProjectGalleryViewer from '../components/project/ProjectGalleryViewer'

type ProjectWithUi = Project & { hasAvailability?: boolean; availablePhasesCount?: number; nameEn?: string; locationEn?: string }

const MotionBox = motion.create(Box)
const MotionCard = motion.create(Card)

export default function ProjectDetails() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectWithUi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [galleryViewerOpen, setGalleryViewerOpen] = useState(false)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null)
  const [selectedGalleryTag, setSelectedGalleryTag] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!id) return
      setIsLoading(true)
      try {
        const res = await getProject(id)
        if (res.success && res.data) setProject(res.data as ProjectWithUi)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const title = useMemo(() => {
    if (!project) return ''
    return i18n.language === 'ar' ? project.nameAr : project.name
  }, [project, i18n.language])

  const location = useMemo(() => {
    if (!project) return ''
    return i18n.language === 'ar' ? project.locationAr : project.location
  }, [project, i18n.language])

  // Format gallery for CircularGallery
  const galleryItems = useMemo(() => {
    if (!project) return []
    return (project.gallery || []).map(g => ({
      image: g.url,
      text: i18n.language === 'ar' ? g.tagAr : g.tagEn
    }))
  }, [project, i18n.language])

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          {t('project.notFound', 'Project not found')}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          {t('common.back', 'Back')}
        </Button>
      </Container>
    )
  }

  const notes: ProjectNote[] = project.notes || []
  
  // Filter out the attachments that are mapped to specific visual spots
  const attachments: ProjectAttachment[] = (project.attachments || []).filter(a => {
    const title = (a.title || '').toLowerCase()
    return !title.includes('project-logo') && 
           !title.includes('project logo') && 
           !title.includes('project-video-advert') && 
           !title.includes('video advert') && 
           !title.includes('project-top-plan') && 
           !title.includes('project top plan') && 
           !title.includes('project-hero') && 
           !title.includes('project hero') &&
           !title.includes('project-brochure') &&
           !title.includes('project brochure') &&
           !title.includes('project-gallery') &&
           !title.includes('project gallery')
  })

  // Determine if video is native
  const isNativeVideo = project.featuredVideoUrl && 
                        (project.featuredVideoUrl.endsWith('.mp4') || 
                         project.featuredVideoUrl.endsWith('.webm') ||
                         project.featuredVideoUrl.includes('salesforce-file'))


  const handleGalleryClick = (clickedMedia: any) => {
    setSelectedGalleryImage(clickedMedia.image);
    setSelectedGalleryTag(clickedMedia.text);
    setGalleryViewerOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f7fa', pb: 10 }}>
      {/* Sticky Header */}
      <Paper
        sx={(theme) => ({
          position: 'sticky',
          top: 0,
          zIndex: 40,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
        })}
        elevation={0}
      >
        <Container maxWidth="xl" sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button startIcon={<ArrowRight />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
              {t('common.back', 'Back')}
            </Button>
            <Button component={RouterLink} to={`/search?projectId=${project.id}`} variant="outlined" size="small" sx={{ borderRadius: 8, px: 3 }}>
              {t('home.viewUnits', 'View units')}
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Hero Section */}
      <Box sx={{ position: 'relative', height: { xs: '60vh', md: '75vh' }, minHeight: 400, overflow: 'hidden' }}>
        <Box 
          component="img" 
          src={project.coverImageUrl || '/placeholder.jpg'} 
          alt={title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 100%)' }} />

        {/* Animated Sun Flare 1 */}
        <MotionBox
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: { xs: '120vw', md: '60vw' },
            height: { xs: '120vw', md: '60vw' },
            background: 'radial-gradient(circle, rgba(255,220,150,0.4) 0%, rgba(255,200,100,0.15) 30%, rgba(255,255,255,0) 70%)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Animated Sun Flare 2 */}
        <MotionBox
          animate={{
            opacity: [0.1, 0.5, 0.1],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 12,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 2,
          }}
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '-20%',
            width: { xs: '150vw', md: '80vw' },
            height: { xs: '150vw', md: '80vw' },
            background: 'radial-gradient(circle, rgba(255,180,120,0.3) 0%, rgba(255,150,80,0.1) 40%, rgba(255,255,255,0) 70%)',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        
        <Container maxWidth="xl" sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', pb: 6 }}>
          <MotionBox 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: 'easeOut' }}
            sx={{ width: '100%', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'flex-end' }, justifyContent: 'space-between', gap: 3 }}
          >
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {project.logoUrl && (
                <Box 
                  sx={{ 
                    width: { xs: 80, md: 120 }, 
                    height: { xs: 80, md: 120 }, 
                    bgcolor: 'white', 
                    borderRadius: 4, 
                    p: 1.5, 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)' 
                  }}
                >
                  <Box component="img" src={project.logoUrl} alt="Logo" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
              )}
              <Box>
                <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', textShadow: '0 4px 12px rgba(0,0,0,0.3)', mb: 1, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                  {title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.9)' }}>
                  <MapPin size={18} />
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {location}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={() => setIsRegisterModalOpen(true)}
              sx={{
                py: 2,
                px: 5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 8,
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}
            >
              {t('home.registerInterest')}
            </Button>
          </MotionBox>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: -4, position: 'relative', zIndex: 10 }}>
        
        {/* Availability Badge */}
        {typeof project.availablePhasesCount === 'number' && (
          <MotionBox initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} sx={{ mb: 4 }}>
            <Chip
              size="medium"
              color={project.availablePhasesCount > 0 ? 'success' : 'default'}
              label={
                project.availablePhasesCount > 0
                  ? t('home.phasesAvailable', { count: project.availablePhasesCount })
                  : t('home.soldOut', 'Sold out')
              }
              sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2.5, px: 2, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </MotionBox>
        )}

        <Grid container spacing={4}>
          
          {/* Left Column: Visuals & Map */}
          <Grid size={{ xs: 12, lg: 8 }}>
            
            {/* Video Advert Section */}
            {project.featuredVideoUrl && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                sx={{ mb: 4, position: 'relative', borderRadius: 4, overflow: 'hidden' }}
              >
                {/* Animated Gradient Frame */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: -2,
                    background: 'linear-gradient(45deg, #FF8A00, #E52E71, #FF8A00)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-border 3s ease infinite',
                    zIndex: 0,
                    borderRadius: 4,
                    '@keyframes gradient-border': {
                      '0%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' },
                      '100%': { backgroundPosition: '0% 50%' },
                    }
                  }}
                />
                
                {/* Video Container */}
                <Box sx={{ position: 'relative', zIndex: 1, width: '100%', borderRadius: 'calc(16px - 2px)', overflow: 'hidden', bgcolor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isNativeVideo ? (
                    <video src={project.featuredVideoUrl} autoPlay muted loop playsInline controls style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: '80vh' }} />
                  ) : (
                    <Box component="iframe" src={project.featuredVideoUrl} sx={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                  )}
                </Box>
              </MotionBox>
            )}

            {/* Circular Gallery Section */}
            {galleryItems.length > 0 && (
              <MotionCard
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)', bgcolor: '#1a1a1a' }}
              >
                <CardContent sx={{ p: 0, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
                      <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                        <ImageIcon size={24} />
                      </Box>
                      <Typography variant="h6" fontWeight="bold">{t('project.gallery', 'Project Gallery')}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1, ml: 1 }}>
                      {t('project.galleryHint', 'Drag to explore. Click to view.')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ width: '100%', height: { xs: 400, md: 600 } }}>
                    <CircularGallery 
                      items={galleryItems} 
                      bend={3} 
                      textColor="#ffffff" 
                      borderRadius={0.05} 
                      onClick={handleGalleryClick} 
                    />
                  </Box>
                </CardContent>
              </MotionCard>
            )}

            {/* Top Plan Section */}
            {project.topPlanUrl && (
              <MotionCard
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)', bgcolor: 'white' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Master Plan</Typography>
                  <Box sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', bgcolor: 'grey.50' }}>
                    <Box component="img" src={project.topPlanUrl} alt="Top Plan" sx={{ width: '100%', height: 'auto', display: 'block' }} />
                  </Box>
                </CardContent>
              </MotionCard>
            )}

            {/* Brochure Section */}
            {project.brochureUrl && (
              <MotionCard
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)', bgcolor: '#1a1a1a' }}
              >
                <CardContent sx={{ p: 0, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10, pointerEvents: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
                      <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                        <FileText size={24} />
                      </Box>
                      <Typography variant="h6" fontWeight="bold">{t('project.brochure', 'Project Brochure')}</Typography>
                    </Box>
                  </Box>
                  <ProjectBrochureViewer pdfUrl={project.brochureUrl} />
                </CardContent>
              </MotionCard>
            )}

            {/* Map Section */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)', bgcolor: 'white', mb: { xs: 4, lg: 0 } }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Location</Typography>
                <Box sx={{ borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                  <OpenStreetProjectMap
                    centroid={
                      typeof project.mapCentroidLat === 'number' && typeof project.mapCentroidLng === 'number'
                        ? { lat: project.mapCentroidLat, lng: project.mapCentroidLng }
                        : undefined
                    }
                    geometry={project.mapGeometryJson}
                    height={400}
                  />
                </Box>
                <NearbyAmenities lat={project.mapCentroidLat} lng={project.mapCentroidLng} />
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Right Column: Details & Attachments */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'sticky', top: 100 }}>
              
              {/* Notes */}
              <MotionCard
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                sx={{ borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.8)', bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main' }}><FileText size={20} /></Box>
                    <Typography variant="h6" fontWeight="bold">{t('project.notes', 'Notes')}</Typography>
                  </Box>
                  {notes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">{t('project.noNotes', 'No notes available')}</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {notes.map((n) => (
                        <MuiLink key={n.id} href={n.url} target="_blank" rel="noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: 2, bgcolor: 'white', textDecoration: 'none', color: 'text.primary', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: 'primary.main' } }}>
                          <FileText size={18} opacity={0.6} />
                          <Typography variant="body2" fontWeight="medium" sx={{ flexGrow: 1 }}>{n.title}</Typography>
                          <ExternalLink size={16} opacity={0.4} />
                        </MuiLink>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </MotionCard>


              {/* Attachments */}
              <MotionCard
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                sx={{ borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.8)', bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main' }}><ImageIcon size={20} /></Box>
                    <Typography variant="h6" fontWeight="bold">{t('project.attachments', 'Attachments')}</Typography>
                  </Box>
                  {attachments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">{t('project.noAttachments', 'No attachments available')}</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {attachments.map((a) => (
                        <MuiLink key={a.id} href={a.url} target="_blank" rel="noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: 2, bgcolor: 'white', textDecoration: 'none', color: 'text.primary', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: 'primary.main' } }}>
                          <ImageIcon size={18} opacity={0.6} />
                          <Typography variant="body2" fontWeight="medium" sx={{ flexGrow: 1 }}>{a.title}</Typography>
                          <ExternalLink size={16} opacity={0.4} />
                        </MuiLink>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </MotionCard>

            </Box>
          </Grid>
        </Grid>
      </Container>

      <RegisterInterestModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        projectId={project.id}
        projectName={title}
        fallbackProvinceRegion={project.provinceRegion}
        fallbackCity={project.city}
      />


      <ProjectGalleryViewer
        isOpen={galleryViewerOpen}
        onClose={() => setGalleryViewerOpen(false)}
        imageUrl={selectedGalleryImage}
        tagText={selectedGalleryTag}
      />
    </Box>
  )
}
