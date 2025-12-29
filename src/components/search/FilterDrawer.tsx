import { useEffect, useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Divider,
  Stack,
} from '@mui/material'
import { Close, Refresh as RefreshIcon } from '@mui/icons-material'
import { useAppStore } from '../../lib/store'
import { getProjects } from '../../lib/api-client'
import { Project, Phase } from '../../lib/types'

const bedroomOptions = [
  { value: '', label: 'الكل' },
  { value: '1', label: '1 غرفة' },
  { value: '2', label: '2 غرف' },
  { value: '3', label: '3 غرف' },
  { value: '4', label: '4 غرف' },
  { value: '5', label: '5+ غرف' },
]

const statusOptions = [
  { value: '', label: 'الكل' },
  { value: 'Available', label: 'متاح' },
  { value: 'Reserved', label: 'محجوز' },
  { value: 'Sold', label: 'مباع' },
]

const priceOptions = [
  { value: '', label: 'الكل' },
  { value: '0-1000000', label: 'أقل من مليون ريال' },
  { value: '1000000-2000000', label: '1 - 2 مليون ريال' },
  { value: '2000000-3000000', label: '2 - 3 مليون ريال' },
  { value: '3000000-5000000', label: '3 - 5 مليون ريال' },
  { value: '5000000-999999999', label: 'أكثر من 5 مليون ريال' },
]

const yearOptions = [
  { value: '', label: 'الكل' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
]

export default function FilterDrawer() {
  const { isFilterDrawerOpen, setFilterDrawerOpen, filters, setFilters, clearFilters } = useAppStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [phases, setPhases] = useState<Phase[]>([])

  const [localFilters, setLocalFilters] = useState({
    projectId: filters.projectId || '',
    phaseId: filters.phaseId || '',
    bedrooms: filters.bedrooms?.toString() || '',
    status: filters.status || '',
    priceRange: '',
    deliveryYear: filters.deliveryYear?.toString() || '',
  })

  useEffect(() => {
    async function loadProjects() {
      const response = await getProjects()
      if (response.success && response.data) {
        setProjects(response.data)
      }
    }
    loadProjects()
  }, [])

  useEffect(() => {
    if (localFilters.projectId) {
      const project = projects.find((p) => p.id === localFilters.projectId)
      setPhases(project?.phases || [])
    } else {
      setPhases([])
    }
  }, [localFilters.projectId, projects])

  useEffect(() => {
    setLocalFilters({
      projectId: filters.projectId || '',
      phaseId: filters.phaseId || '',
      bedrooms: filters.bedrooms?.toString() || '',
      status: filters.status || '',
      priceRange: '',
      deliveryYear: filters.deliveryYear?.toString() || '',
    })
  }, [filters])

  const projectOptions = [
    { value: '', label: 'جميع المشاريع' },
    ...projects.map((p) => ({ value: p.id, label: p.nameAr })),
  ]

  const phaseOptions = [
    { value: '', label: 'جميع المراحل' },
    ...phases.map((p) => ({ value: p.id, label: p.nameAr })),
  ]

  const handleApply = () => {
    const [minPrice, maxPrice] = localFilters.priceRange
      ? localFilters.priceRange.split('-').map(Number)
      : [undefined, undefined]

    setFilters({
      projectId: localFilters.projectId || undefined,
      phaseId: localFilters.phaseId || undefined,
      bedrooms: localFilters.bedrooms ? parseInt(localFilters.bedrooms) : undefined,
      status: (localFilters.status as 'Available' | 'Reserved' | 'Sold') || undefined,
      minPrice,
      maxPrice,
      deliveryYear: localFilters.deliveryYear ? parseInt(localFilters.deliveryYear) : undefined,
    })
    setFilterDrawerOpen(false)
  }

  const handleReset = () => {
    setLocalFilters({
      projectId: '',
      phaseId: '',
      bedrooms: '',
      status: '',
      priceRange: '',
      deliveryYear: '',
    })
    clearFilters()
  }

  const hasActiveFilters = Object.values(localFilters).some((v) => v !== '')

  return (
    <Drawer
      anchor="bottom"
      open={isFilterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '85vh',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 6,
              bgcolor: 'grey.300',
              borderRadius: 3,
            }}
          />
        </Box>
      </Box>

      <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="semibold">
          تصفية النتائج
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              sx={{ fontSize: '0.875rem' }}
            >
              إعادة تعيين
            </Button>
          )}
          <IconButton onClick={() => setFilterDrawerOpen(false)} size="small">
            <Close />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: 2, overflowY: 'auto', maxHeight: '60vh' }}>
        <Stack spacing={2}>
          <TextField
            select
            label="المشروع"
            value={localFilters.projectId}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                projectId: e.target.value,
                phaseId: '',
              })
            }
            fullWidth
          >
            {projectOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {localFilters.projectId && (
            <TextField
              select
              label="المرحلة"
              value={localFilters.phaseId}
              onChange={(e) => setLocalFilters({ ...localFilters, phaseId: e.target.value })}
              fullWidth
            >
              {phaseOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            select
            label="عدد الغرف"
            value={localFilters.bedrooms}
            onChange={(e) => setLocalFilters({ ...localFilters, bedrooms: e.target.value })}
            fullWidth
          >
            {bedroomOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="نطاق السعر"
            value={localFilters.priceRange}
            onChange={(e) => setLocalFilters({ ...localFilters, priceRange: e.target.value })}
            fullWidth
          >
            {priceOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="الحالة"
            value={localFilters.status}
            onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
            fullWidth
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="سنة التسليم"
            value={localFilters.deliveryYear}
            onChange={(e) => setLocalFilters({ ...localFilters, deliveryYear: e.target.value })}
            fullWidth
          >
            {yearOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }} className="safe-bottom">
        <Button variant="contained" fullWidth onClick={handleApply} size="large">
          تطبيق الفلاتر
        </Button>
      </Box>
    </Drawer>
  )
}

