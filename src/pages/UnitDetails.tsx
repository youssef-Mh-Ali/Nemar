import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material'
import { ArrowRight, ChevronLeft, ChevronRight, Bed, Bath, Maximize, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import UnitCard from '../components/search/UnitCard'
import RegisterInterestModal from '../components/home/RegisterInterestModal'
import ImageGallery from '../components/ui/ImageGallery'
import FavoriteButton from '../components/ui/FavoriteButton'
import ShareButton from '../components/ui/ShareButton'
import { getUnit } from '../lib/api-client'
import { useAuthStore } from '../lib/store'
import { Unit } from '../lib/types'

export default function UnitDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [relatedUnits, setRelatedUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  useEffect(() => {
    async function loadUnit() {
      if (!id) return
      setIsLoading(true)
      try {
        const response = await getUnit(id)
        if (response.success && response.data) {
          setUnit(response.data.unit)
          setRelatedUnits(response.data.relatedUnits)
        }
      } catch (error) {
        console.error('Error loading unit:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUnit()
  }, [id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
    })
  }

  const nextImage = () => {
    if (unit) {
      setActiveImageIndex((prev) => (prev + 1) % unit.images.length)
    }
  }

  const prevImage = () => {
    if (unit) {
      setActiveImageIndex((prev) => (prev === 0 ? unit.images.length - 1 : prev - 1))
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!unit) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          الوحدة غير موجودة
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          عذراً، لم نتمكن من العثور على هذه الوحدة
        </Typography>
        <Button variant="contained" onClick={() => navigate('/search')}>
          العودة للبحث
        </Button>
      </Container>
    )
  }

  const statusColors: Record<Unit['status'], 'success' | 'warning' | 'error'> = {
    Available: 'success',
    Reserved: 'warning',
    Sold: 'error',
  }

  const statusLabels: Record<Unit['status'], string> = {
    Available: 'متاح',
    Reserved: 'محجوز',
    Sold: 'مباع',
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Back Button */}
      <Paper
        sx={{
          position: 'sticky',
          top: 64,
          zIndex: 30,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg" sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              startIcon={<ArrowRight />}
              onClick={() => navigate(-1)}
              sx={{ color: 'text.secondary' }}
            >
              رجوع
            </Button>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <FavoriteButton unitId={unit.id} size="small" />
              <ShareButton
                url={`${window.location.origin}/unit/${unit.id}`}
                title={unit.projectNameAr}
                text={`اكتشف ${unit.unitNumber} في ${unit.projectNameAr}`}
                image={unit.images[0]}
                size="small"
              />
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {/* Gallery */}
        <Box
          onClick={() => setIsGalleryOpen(true)}
          sx={{
            position: 'relative',
            aspectRatio: { xs: '16/10', md: '16/9' },
            bgcolor: 'primary.dark',
            borderRadius: { xs: 0, md: 2 },
            overflow: 'hidden',
            mb: 3,
            mt: 2,
            cursor: 'pointer',
          }}
        >
          <Box
            component="img"
            src={unit.images[activeImageIndex]}
            alt={`Unit ${unit.unitNumber}`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {unit.images.length > 1 && (
            <>
              <IconButton
                onClick={prevImage}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
              >
                <ChevronRight />
              </IconButton>
              <IconButton
                onClick={nextImage}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 1,
                }}
              >
                {unit.images.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: index === activeImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Box>
            </>
          )}
          <Chip
            label={statusLabels[unit.status]}
            color={statusColors[unit.status]}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
            }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ px: { xs: 2, md: 0 }, pb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Chip label={unit.unitNumber} sx={{ mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {formatPrice(unit.price)}
                </Typography>
              </Box>
            </Box>

            {/* Project & Location */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: 'text.secondary' }}>
              <Typography variant="body2">
                {unit.projectNameAr} • {unit.phaseNameAr}
              </Typography>
            </Box>

            {/* Specs Grid */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={4}>
                  // -expect-error - MUI v7 Grid API
<Grid item={true} xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Bed size={24} color="#1a365d" style={{ margin: '0 auto 8px', display: 'block' }} />
                      <Typography variant="caption" color="text.secondary" display="block">
                        غرف النوم
                      </Typography>
                      <Typography variant="h6" fontWeight="semibold">
                        {unit.bedrooms}
                      </Typography>
                    </Box>
                  </Grid>
                  {unit.bathrooms && (
                    // -expect-error - MUI v7 Grid API
<Grid item={true} xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Bath size={24} color="#1a365d" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <Typography variant="caption" color="text.secondary" display="block">
                          دورات المياه
                        </Typography>
                        <Typography variant="h6" fontWeight="semibold">
                          {unit.bathrooms}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  // -expect-error - MUI v7 Grid API
<Grid item={true} xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Maximize size={24} color="#1a365d" style={{ margin: '0 auto 8px', display: 'block' }} />
                      <Typography variant="caption" color="text.secondary" display="block">
                        المساحة
                      </Typography>
                      <Typography variant="h6" fontWeight="semibold">
                        {unit.area} م²
                      </Typography>
                    </Box>
                  </Grid>
                  // -expect-error - MUI v7 Grid API
<Grid item={true} xs={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Calendar size={24} color="#1a365d" style={{ margin: '0 auto 8px', display: 'block' }} />
                      <Typography variant="caption" color="text.secondary" display="block">
                        التسليم
                      </Typography>
                      <Typography variant="h6" fontWeight="semibold">
                        {formatDate(unit.deliveryDate)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Description */}
            {unit.descriptionAr && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="semibold" gutterBottom>
                  الوصف
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {unit.descriptionAr}
                </Typography>
              </Box>
            )}

            {/* CTAs */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => setIsRegisterModalOpen(true)}
                disabled={unit.status === 'Sold'}
              >
                {unit.status === 'Sold' ? 'مباع' : 'سجل اهتمامك'}
              </Button>
              {user && (
                <Button component={Link} to="/community" variant="outlined" size="large" fullWidth>
                  فتح طلب دعم
                </Button>
              )}
            </Box>

            {/* Related Units */}
            {relatedUnits.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight="semibold" gutterBottom>
                  وحدات مشابهة
                </Typography>
                <Grid container spacing={2}>
                  {relatedUnits.map((relatedUnit) => (
                    // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} sm={6} key={relatedUnit.id}>
                      <UnitCard unit={relatedUnit} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </motion.div>
        </Box>
      </Container>

      {/* Register Interest Modal */}
      <RegisterInterestModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        projectId={unit.projectId}
        phaseId={unit.phaseId}
        unitId={unit.id}
        projectName={unit.projectNameAr}
      />

      {/* Image Gallery */}
      {isGalleryOpen && (
        <ImageGallery
          images={unit.images}
          initialIndex={activeImageIndex}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </Box>
  )
}

