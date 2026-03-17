import { Link } from 'react-router-dom'
import { Card, CardContent, Chip, Box, Typography, Divider, LinearProgress } from '@mui/material'
import { motion } from 'framer-motion'
import { Bed, Bath, Maximize, Calendar, Receipt } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Unit } from '../../lib/types'
import FavoriteButton from '../ui/FavoriteButton'
import LazyImage from '../ui/LazyImage'

interface UnitCardProps {
  unit: Unit
  index?: number
}

export default function UnitCard({ unit, index = 0 }: UnitCardProps) {
  const { t, i18n } = useTranslation()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
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
    Available: t('unit.available'),
    Reserved: t('unit.reserved'),
    Sold: t('unit.sold'),
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
          <LazyImage
            src={unit.images[0] || '/placeholder.jpg'}
            alt={`Unit ${unit.unitNumber}`}
            objectFit="cover"
            sx={{
              height: '100%',
              transition: 'transform 0.5s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
          <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5, zIndex: 2 }}>
            <FavoriteButton unitId={unit.id} size="small" />
            <Chip
              label={statusLabels[unit.status]}
              color={statusColors[unit.status]}
              size="small"
            />
          </Box>
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
            {i18n.language.startsWith('ar') ? unit.projectNameAr : unit.projectName} • {i18n.language.startsWith('ar') ? unit.phaseNameAr : unit.phaseName}
          </Typography>

          {unit.paymentPlan && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.100' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
                  {unit.paymentPlan.status === 'Fully Paid' ? (i18n.language === 'ar' ? ' مدفوعة بالكامل' : 'Fully Paid') : (i18n.language === 'ar' ? 'خطة الدفع' : 'Payment Plan')}
                </Typography>
                <Typography variant="body2" color="primary.main">
                  {unit.paymentPlan.percentagePaid}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={unit.paymentPlan.percentagePaid} 
                sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: 'primary.100' }} 
              />
              <Box sx={{ display: 'flex', gap: 2, fontSize: '0.75rem', mt: 1 }}>
                {unit.paymentPlan.installmentsRemaining !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <Calendar size={14} />
                    <Typography variant="caption">{unit.paymentPlan.installmentsRemaining} {i18n.language === 'ar' ? 'أقساط متبقية' : 'Installments remaining'}</Typography>
                  </Box>
                )}
                {unit.paymentPlan.hasMaintenanceCheque && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main' }}>
                    <Receipt size={14} />
                    <Typography variant="caption">{i18n.language === 'ar' ? 'شيك صيانة معلق' : 'Pending maintenance cheque'}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Bed size={16} />
              <Typography variant="caption">{unit.bedrooms} {t('unit.bedrooms')}</Typography>
            </Box>
            {unit.bathrooms && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Bath size={16} />
                <Typography variant="caption">{unit.bathrooms}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Maximize size={16} />
              <Typography variant="caption">{unit.area} {t('unit.areaUnit')}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
            <Calendar size={16} />
            <Typography variant="caption">{t('unit.delivery')}: {formatDate(unit.deliveryDate)}</Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

