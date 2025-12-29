import { useEffect, useState } from 'react'
import { Box, Container, Typography, Card, CardContent, CardMedia, Chip, Grid, Skeleton, Link as MuiLink } from '@mui/material'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Building2, ArrowLeft } from 'lucide-react'
import { getProjects } from '../../lib/api-client'
import { Project } from '../../lib/types'

interface ProjectWithAvailability extends Project {
  hasAvailability: boolean
  availablePhasesCount?: number
}

export default function ProjectsGrid() {
  const [projects, setProjects] = useState<ProjectWithAvailability[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await getProjects()
        if (response.success && response.data) {
          setProjects(response.data)
        }
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProjects()
  }, [])

  return (
    <Box id="latest-projects" sx={{ py: 8, px: { xs: 2, md: 3 }, bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Chip
              label="مشاريعنا"
              sx={{
                bgcolor: 'secondary.main',
                color: 'primary.dark',
                fontWeight: 500,
                mb: 2,
              }}
            />
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              أحدث المشاريع
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '36rem', mx: 'auto' }}>
              استكشف مجموعتنا المتميزة من المشاريع السكنية في أفضل مواقع المملكة
            </Typography>
          </motion.div>
        </Box>

        {/* Projects Grid */}
        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} md={6} lg={4} key={i}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton height={24} width="70%" sx={{ mb: 1 }} />
                    <Skeleton height={16} width="50%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project, index) => (
              // -expect-error - MUI v7 Grid API
<Grid item={true} xs={12} md={6} lg={4} key={project.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    component={Link}
                    to={`/search?projectId=${project.id}`}
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
                    <Box sx={{ position: 'relative', height: { xs: 192, md: 224 }, overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        image={project.coverImageUrl}
                        alt={project.nameAr}
                        sx={{
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      />
                      {/* Availability Badge */}
                      <Chip
                        label={
                          project.hasAvailability
                            ? `${project.availablePhasesCount} مراحل متاحة`
                            : 'مباع بالكامل'
                        }
                        color={project.hasAvailability ? 'success' : 'error'}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                        }}
                      />
                      {/* Gradient */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" fontWeight="semibold" gutterBottom>
                        {project.nameAr}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, color: 'text.secondary' }}>
                        <MapPin size={16} />
                        <Typography variant="body2">{project.locationAr}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <Building2 size={16} />
                          <Typography variant="caption">{project.phases.length} مراحل</Typography>
                        </Box>
                        <MuiLink
                          component="span"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'primary.main',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            '&:hover': {
                              gap: 1,
                            },
                          }}
                        >
                          عرض الوحدات
                          <ArrowLeft size={16} />
                        </MuiLink>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <MuiLink
              component={Link}
              to="/search"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                color: 'primary.main',
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.light',
                },
              }}
            >
              عرض جميع الوحدات
              <ArrowLeft size={20} />
            </MuiLink>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}

