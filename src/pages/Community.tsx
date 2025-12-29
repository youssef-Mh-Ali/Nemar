import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  Grid,
} from '@mui/material'
import { Building2, Plus, FileText, User } from 'lucide-react'
import { motion } from 'framer-motion'
import UnitCard from '../components/search/UnitCard'
import CaseForm from '../components/community/CaseForm'
import CaseList from '../components/community/CaseList'
import { useAuthStore } from '../lib/store'
import { getMyUnits, getCases } from '../lib/api-client'
import { Unit, Case } from '../lib/types'

export default function Community() {
  const navigate = useNavigate()
  const { user, token } = useAuthStore()
  const [units, setUnits] = useState<Unit[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'units' | 'cases'>('units')
  const [isCaseFormOpen, setIsCaseFormOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    async function loadData() {
      setIsLoading(true)
      try {
        const [unitsRes, casesRes] = await Promise.all([
          getMyUnits(token || undefined),
          getCases(token || undefined),
        ])

        if (unitsRes.success && unitsRes.data) {
          setUnits(unitsRes.data)
        }
        if (casesRes.success && casesRes.data) {
          setCases(casesRes.data)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, token, navigate])

  const refreshCases = async () => {
    const casesRes = await getCases(token || undefined)
    if (casesRes.success && casesRes.data) {
      setCases(casesRes.data)
    }
  }

  if (!user) {
    return null
  }

  const activeCasesCount = cases.filter((c) => c.status === 'New' || c.status === 'InProgress').length

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', px: { xs: 2, md: 3 }, py: 4 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Box
              component="img"
              src="/BinSaedanLogo-White.png"
              alt="فيصل بن سعيدان"
              sx={{
                height: 40,
                width: 'auto',
                mb: 3,
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={24} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  مرحباً
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {user.firstName} {user.lastName}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              مرحباً بك في مجتمع فيصل بن سعيدان
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Stats */}
      <Container maxWidth="lg" sx={{ mt: -2 }}>
        <Grid container spacing={2}>
          // -expect-error - MUI v7 Grid API
<Grid item={true} xs={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Building2 size={24} color="#1a365d" style={{ margin: '0 auto 8px', display: 'block' }} />
                <Typography variant="h4" fontWeight="bold">
                  {units.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  وحداتي
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          // -expect-error - MUI v7 Grid API
<Grid item={true} xs={6}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <FileText size={24} color="#1a365d" style={{ margin: '0 auto 8px', display: 'block' }} />
                <Typography variant="h4" fontWeight="bold">
                  {cases.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  طلباتي
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Tabs */}
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            bgcolor: 'grey.50',
            borderRadius: 2,
            p: 0.5,
            '& .MuiTabs-indicator': { display: 'none' },
          }}
        >
          <Tab
            value="units"
            label="وحداتي"
            sx={{
              flex: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                bgcolor: 'background.paper',
                boxShadow: 1,
              },
            }}
          />
          <Tab
            value="cases"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                طلباتي
                {activeCasesCount > 0 && (
                  <Badge badgeContent={activeCasesCount} color="warning" />
                )}
              </Box>
            }
            sx={{
              flex: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                bgcolor: 'background.paper',
                boxShadow: 1,
              },
            }}
          />
        </Tabs>
      </Container>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : activeTab === 'units' ? (
          <Box>
            {units.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Building2 size={48} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
                <Typography variant="h6" fontWeight="semibold" gutterBottom>
                  لا توجد وحدات
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  لم يتم تسجيل أي وحدات باسمك
                </Typography>
                <Button component={Link} to="/search" variant="contained">
                  استكشف الوحدات
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {units.map((unit) => (
                  // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} sm={6} key={unit.id}>
                    <UnitCard unit={unit} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => setIsCaseFormOpen(true)}
              >
                طلب جديد
              </Button>
            </Box>
            <CaseList cases={cases} />
          </Box>
        )}
      </Container>

      {/* Case Form Modal */}
      <CaseForm
        isOpen={isCaseFormOpen}
        onClose={() => setIsCaseFormOpen(false)}
        units={units}
        onSuccess={refreshCases}
      />
    </Box>
  )
}

