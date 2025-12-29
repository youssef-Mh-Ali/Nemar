import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  CircularProgress,
} from '@mui/material'
import { Badge } from '@mui/material'
import UnitCard from '../components/search/UnitCard'
import FilterDrawer from '../components/search/FilterDrawer'
import DesktopFilters from '../components/search/DesktopFilters'
import { useAppStore } from '../lib/store'
import { searchUnits } from '../lib/api-client'
import { Unit } from '../lib/types'

export default function Search() {
  const [searchParams] = useSearchParams()
  const { filters, setFilters, setFilterDrawerOpen } = useAppStore()
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Set initial filter from URL params
  useEffect(() => {
    const projectId = searchParams.get('projectId')
    if (projectId) {
      setFilters({ ...filters, projectId })
    }
  }, [searchParams])

  // Fetch units when filters change
  useEffect(() => {
    async function loadUnits() {
      setIsLoading(true)
      try {
        const response = await searchUnits(filters)
        if (response.success && response.data) {
          setUnits(response.data)
        }
      } catch (error) {
        console.error('Error loading units:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUnits()
  }, [filters])

  const activeFiltersCount = Object.values(filters).filter((v) => v !== undefined).length

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper
        sx={{
          position: 'sticky',
          top: 64,
          zIndex: 30,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight="semibold">
                البحث عن وحدة
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isLoading ? 'جاري البحث...' : `${units.length} وحدة`}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* View Toggle - Desktop */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                <ToggleButton value="grid">
                  <LayoutGrid size={16} />
                </ToggleButton>
                <ToggleButton value="list">
                  <List size={16} />
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Filter Button - Mobile */}
              <Badge badgeContent={activeFiltersCount} color="primary">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setFilterDrawerOpen(true)}
                  startIcon={<SlidersHorizontal size={16} />}
                  sx={{ display: { xs: 'flex', md: 'none' } }}
                >
                  تصفية
                </Button>
              </Badge>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Desktop Sidebar */}
          // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <DesktopFilters />
            </Box>
          </Grid>

          {/* Units Grid */}
          // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} md={9}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : units.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <SearchIcon size={64} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
                <Typography variant="h6" fontWeight="semibold" gutterBottom>
                  لا توجد نتائج
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  جرب تغيير معايير البحث للعثور على وحدات أخرى
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setFilterDrawerOpen(true)}
                  sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                >
                  تعديل الفلاتر
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {units.map((unit, index) => (
                  // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} sm={6} lg={viewMode === 'grid' ? 4 : 12} key={unit.id}>
                    <UnitCard unit={unit} index={index} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filter Drawer */}
      <FilterDrawer />
    </Box>
  )
}

