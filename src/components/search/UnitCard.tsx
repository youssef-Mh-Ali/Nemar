import { Link } from 'react-router-dom'
import { Card, CardContent, CardMedia, Chip, Box, Typography, Divider } from '@mui/material'
import { motion } from 'framer-motion'
import { Bed, Bath, Maximize, Calendar } from 'lucide-react'
import { Unit } from '../../lib/types'

interface UnitCardProps {
  unit: Unit
  index?: number
}

export default function UnitCard({ unit, index = 0 }: UnitCardProps) {
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
      month: 'short',
    })
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        component={Link}
        to={`/unit/${unit.id}`}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          textDecoration: 'none',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        <Box sx={{ position: 'relative', height: { xs: 176, md: 192 }, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={unit.images[0] || '/placeholder.jpg'}
            alt={`Unit ${unit.unitNumber}`}
            sx={{
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
          <Chip
            label={statusLabels[unit.status]}
            color={statusColors[unit.status]}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
            }}
          >
            {unit.unitNumber}
          </Box>
        </Box>

        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
            {formatPrice(unit.price)}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {unit.projectNameAr} • {unit.phaseNameAr}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Bed size={16} />
              <Typography variant="caption">{unit.bedrooms} غرف</Typography>
            </Box>
            {unit.bathrooms && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Bath size={16} />
                <Typography variant="caption">{unit.bathrooms}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Maximize size={16} />
              <Typography variant="caption">{unit.area} م²</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
            <Calendar size={16} />
            <Typography variant="caption">التسليم: {formatDate(unit.deliveryDate)}</Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

