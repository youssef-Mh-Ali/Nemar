import { useEffect, useState } from 'react'
import { Card, CardContent, Typography, TextField, MenuItem, Button, Stack, Box } from '@mui/material'
import { Refresh } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../lib/store'
import { getProjects } from '../../lib/api-client'
import { Project, Phase } from '../../lib/types'

export default function DesktopFilters() {
  const { t, i18n } = useTranslation()
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

  const bedroomOptions = [
    { value: '', label: t('search.options.all') },
    { value: '1', label: t('search.options.oneRoom') },
    { value: '2', label: t('search.options.twoRooms') },
    { value: '3', label: t('search.options.threeRooms') },
    { value: '4', label: t('search.options.fourRooms') },
    { value: '5', label: t('search.options.fivePlusRooms') },
  ]

  const statusOptions = [
    { value: '', label: t('search.options.all') },
    { value: 'Available', label: t('search.options.available') },
    { value: 'Reserved', label: t('search.options.reserved') },
    { value: 'Sold', label: t('search.options.sold') },
  ]

  const yearOptions = [
    { value: '', label: t('search.options.all') },
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
    { value: '2027', label: '2027' },
  ]

  const projectOptions = [
    { value: '', label: t('search.options.allProjects') },
    ...projects.map((p) => ({ value: p.id, label: i18n.language.startsWith('ar') ? p.nameAr : p.name })),
  ]

  const phaseOptions = [
    { value: '', label: t('search.options.allPhases') },
    ...phases.map((p) => ({ value: p.id, label: i18n.language.startsWith('ar') ? p.nameAr : p.name })),
  ]

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined)

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="semibold">
            {t('search.filterResults')}
          </Typography>
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<Refresh />}
              onClick={clearFilters}
              sx={{ fontSize: '0.875rem' }}
            >
              {t('search.reset')}
            </Button>
          )}
        </Box>

        <Stack spacing={2}>
          <TextField
            select
            label={t('search.project')}
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
              label={t('search.phase')}
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
            label={t('search.bedrooms')}
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
            label={t('search.status')}
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
            label={t('search.deliveryYear')}
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

