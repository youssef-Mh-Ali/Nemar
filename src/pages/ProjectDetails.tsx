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
import { ArrowRight, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getProject } from '../lib/api-client'
import type { Project, ProjectAttachment, ProjectNote } from '../lib/types'
import OpenStreetProjectMap from '../components/ui/OpenStreetProjectMap'

type ProjectWithUi = Project & { hasAvailability?: boolean; availablePhasesCount?: number; nameEn?: string; locationEn?: string }

export default function ProjectDetails() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectWithUi | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
  const attachments: ProjectAttachment[] = project.attachments || []

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
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
            <Button startIcon={<ArrowRight />} onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
              {t('common.back', 'Back')}
            </Button>
            <Button component={RouterLink} to={`/search?projectId=${project.id}`} variant="outlined" size="small">
              {t('home.viewUnits', 'View units')}
            </Button>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Card sx={{ overflow: 'hidden', borderRadius: 2, mb: 3 }}>
          {project.coverImageUrl ? (
            <Box
              component="img"
              src={project.coverImageUrl}
              alt={title}
              sx={{ width: '100%', height: { xs: 220, md: 360 }, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{ height: { xs: 220, md: 360 }, bgcolor: 'grey.100' }} />
          )}
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Typography variant="h5" fontWeight="bold">
                {title}
              </Typography>
              {typeof project.availablePhasesCount === 'number' && (
                <Chip
                  size="small"
                  color={project.availablePhasesCount > 0 ? 'success' : 'default'}
                  label={
                    project.availablePhasesCount > 0
                      ? t('home.phasesAvailable', { count: project.availablePhasesCount })
                      : t('home.soldOut', 'Sold out')
                  }
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {location}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ mb: 3 }}>
          <OpenStreetProjectMap
            centroid={
              typeof project.mapCentroidLat === 'number' && typeof project.mapCentroidLng === 'number'
                ? { lat: project.mapCentroidLat, lng: project.mapCentroidLng }
                : undefined
            }
            geometry={project.mapGeometryJson}
            height={360}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <FileText size={18} />
                  <Typography variant="h6" fontWeight="semibold">
                    {t('project.notes', 'Notes')}
                  </Typography>
                </Box>
                {notes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('project.noNotes', 'No notes')}
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {notes.map((n) => (
                      <MuiLink key={n.id} href={n.url} target="_blank" rel="noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        <ExternalLink size={16} />
                        {n.title}
                      </MuiLink>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ImageIcon size={18} />
                  <Typography variant="h6" fontWeight="semibold">
                    {t('project.attachments', 'Attachments')}
                  </Typography>
                </Box>
                {attachments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('project.noAttachments', 'No attachments')}
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {attachments.map((a) => (
                      <MuiLink key={a.id} href={a.url} target="_blank" rel="noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        <ExternalLink size={16} />
                        {a.title}
                      </MuiLink>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

