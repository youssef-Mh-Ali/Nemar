import { useEffect, useState } from 'react'
import { Card, CardContent, Typography, TextField, MenuItem, Button, Stack, Box } from '@mui/material'
import { Refresh } from '@mui/icons-material'
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

const yearOptions = [
  { value: '', label: 'الكل' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
]

export default function DesktopFilters() {
  const { filters, setFilters, clearFilters } = useAppStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [phases, setPhases] = useState<Phase[]>([])

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
    if (filters.projectId) {
      const project = projects.find((p) => p.id === filters.projectId)
      setPhases(project?.phases || [])
    } else {
      setPhases([])
    }
  }, [filters.projectId, projects])

  const projectOptions = [
    { value: '', label: 'جميع المشاريع' },
    ...projects.map((p) => ({ value: p.id, label: p.nameAr })),
  ]

  const phaseOptions = [
    { value: '', label: 'جميع المراحل' },
    ...phases.map((p) => ({ value: p.id, label: p.nameAr })),
  ]

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined)

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="semibold">
            تصفية النتائج
          </Typography>
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<Refresh />}
              onClick={clearFilters}
              sx={{ fontSize: '0.875rem' }}
            >
              إعادة تعيين
            </Button>
          )}
        </Box>

        <Stack spacing={2}>
          <TextField
            select
            label="المشروع"
            value={filters.projectId || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                projectId: e.target.value || undefined,
                phaseId: undefined,
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

          {filters.projectId && (
            <TextField
              select
              label="المرحلة"
              value={filters.phaseId || ''}
              onChange={(e) => setFilters({ ...filters, phaseId: e.target.value || undefined })}
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
            value={filters.bedrooms?.toString() || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                bedrooms: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
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
            label="الحالة"
            value={filters.status || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: (e.target.value as 'Available' | 'Reserved' | 'Sold') || undefined,
              })
            }
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
            value={filters.deliveryYear?.toString() || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                deliveryYear: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            fullWidth
          >
            {yearOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </CardContent>
    </Card>
  )
}

