import { useEffect, useState, useMemo } from 'react'
import { Box, Container, Typography, Button, Paper } from '@mui/material'
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getProjects } from '../../lib/api-client'
import type { Project } from '../../lib/types'

type GeoJsonPolygon = {
  type: 'Polygon'
  coordinates: number[][][]
}

type GeoJsonMultiPolygon = {
  type: 'MultiPolygon'
  coordinates: number[][][][]
}

function isPolygon(g: unknown): g is GeoJsonPolygon {
  return !!g && typeof g === 'object' && (g as unknown as Record<string, unknown>).type === 'Polygon' && Array.isArray((g as unknown as Record<string, unknown>).coordinates)
}

function isMultiPolygon(g: unknown): g is GeoJsonMultiPolygon {
  return !!g && typeof g === 'object' && (g as unknown as Record<string, unknown>).type === 'MultiPolygon' && Array.isArray((g as unknown as Record<string, unknown>).coordinates)
}

function ringToLatLngs(ring: number[][]): LatLngExpression[] {
  // GeoJSON: [lng, lat] -> Leaflet: [lat, lng]
  return ring.map(([lng, lat]) => [lat, lng])
}

// Controller component to handle smooth zoom and bounds fitting
function MapController({
  selectedRegion,
  projects,
  resetTrigger,
}: {
  selectedRegion: string | null
  projects: Array<Project & { renderLat?: number; renderLng?: number }>
  resetTrigger: number
}) {
  const map = useMap()

  useEffect(() => {
    if (!projects.length) return

    const targetProjects = selectedRegion
      ? projects.filter((p) => p.provinceRegion?.toLowerCase() === selectedRegion.toLowerCase())
      : projects

    const pts: [number, number][] = []
    targetProjects.forEach((p) => {
      if (typeof p.renderLat === 'number' && typeof p.renderLng === 'number') {
        pts.push([p.renderLat, p.renderLng])
      } else if (typeof p.mapCentroidLat === 'number' && typeof p.mapCentroidLng === 'number') {
        pts.push([p.mapCentroidLat, p.mapCentroidLng])
      }
      if (isPolygon(p.mapGeometryJson)) {
        p.mapGeometryJson.coordinates.forEach((ring) => {
          ring.forEach(([lng, lat]) => pts.push([lat, lng]))
        })
      } else if (isMultiPolygon(p.mapGeometryJson)) {
        p.mapGeometryJson.coordinates.forEach((poly) => {
          poly.forEach((ring) => {
            ring.forEach(([lng, lat]) => pts.push([lat, lng]))
          })
        })
      }
    })

    if (pts.length > 0) {
      const bounds = L.latLngBounds(pts)
      map.flyToBounds(bounds, { padding: [60, 60], duration: 1.2 })
    } else if (!selectedRegion) {
      // Fallback center if no points available at all
      map.flyTo([24.7136, 46.6753], 6, { duration: 1.2 })
    }
  }, [selectedRegion, projects, resetTrigger, map])

  return null
}

export default function ProjectsMapSection() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [resetTrigger, setResetTrigger] = useState(0)

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await getProjects()
        if (res.success && res.data) {
          // Ensure only genuine Saudi Arabian provinces from FBS data are mapped
          const saudiProvinces = [
            'riyadh', 'الرياض',
            'makkah', 'مكة',
            'madinah', 'المدينة',
            'tabuk', 'تبوك',
            'eastern', 'الشرقية',
            'asir', 'عسير',
            'qassim', 'القصيم',
            'hail', 'حائل',
            'jazan', 'جازان',
            'najran', 'نجران',
            'northern', 'الحدود الشمالية',
            'jouf', 'الجوف',
            'bahah', 'الباحة'
          ]
          const saudiProjects = res.data.filter((p) => {
            const r = (p.provinceRegion || '').toLowerCase()
            return saudiProvinces.some(prov => r.includes(prov))
          })
          setProjects(saudiProjects)
        }
      } catch (err) {
        console.error('Error loading projects map data:', err)
      }
    }
    loadProjects()
  }, [])

  const isRtl = i18n.language === 'ar'

  // Extract unique regions from loaded projects
  const regions = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.provinceRegion).filter((r): r is string => !!r)))
  }, [projects])

  // Precompute project render coordinates so every project is guaranteed to display
  const projectMarkers = useMemo(() => {
    const getRegionCenter = (rName?: string): [number, number] => {
      const lower = (rName || '').toLowerCase()
      if (lower.includes('riyadh') || lower.includes('الرياض')) return [24.7136, 46.6753]
      if (lower.includes('makkah') || lower.includes('مكة')) return [21.4858, 39.1925]
      if (lower.includes('madinah') || lower.includes('المدينة')) return [24.5247, 39.5692]
      if (lower.includes('tabuk') || lower.includes('تبوك')) return [28.3835, 36.5662]
      if (lower.includes('eastern') || lower.includes('الشرقية')) return [26.4207, 50.0888]
      if (lower.includes('asir') || lower.includes('عسير')) return [18.2164, 42.5053]
      return [24.7136, 46.6753]
    }

    const fallbackCounts: Record<string, number> = {}

    return projects.map((project) => {
      let lat = project.mapCentroidLat
      let lng = project.mapCentroidLng

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        if (isPolygon(project.mapGeometryJson) && project.mapGeometryJson.coordinates[0]?.[0]) {
          lat = project.mapGeometryJson.coordinates[0][0][1]
          lng = project.mapGeometryJson.coordinates[0][0][0]
        }
      }

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        const [baseLat, baseLng] = getRegionCenter(project.provinceRegion)
        const key = `${baseLat}-${baseLng}`
        const count = fallbackCounts[key] || 0
        fallbackCounts[key] = count + 1

        // Distribute overlapping fallback markers in a subtle spiral/grid around the base center
        const angle = count * 2.4
        const radius = 0.05 + Math.floor(count / 4) * 0.05
        lat = baseLat + (count === 0 ? 0 : Math.sin(angle) * radius)
        lng = baseLng + (count === 0 ? 0 : Math.cos(angle) * radius)
      }

      return {
        ...project,
        renderLat: lat,
        renderLng: lng,
      }
    })
  }, [projects])

  // Custom marker icon creation helpers
  const getLocalizedRegionName = (rName: string) => {
    if (!rName) return ''
    const lower = rName.toLowerCase()

    if (isRtl) {
      if (lower.includes('riyadh') || lower.includes('الرياض')) return 'منطقة الرياض'
      if (lower.includes('makkah') || lower.includes('مكة')) return 'منطقة مكة المكرمة'
      if (lower.includes('madinah') || lower.includes('المدينة')) return 'منطقة المدينة المنورة'
      if (lower.includes('tabuk') || lower.includes('تبوك')) return 'منطقة تبوك'
      if (lower.includes('eastern') || lower.includes('الشرقية')) return 'المنطقة الشرقية'
      if (lower.includes('asir') || lower.includes('عسير')) return 'منطقة عسير'

      // If it has Arabic text inside, try to extract the Arabic line if multiline
      const lines = rName.split(/[\r\n]+/)
      const arabicLine = lines.find((l) => /[\u0600-\u06FF]/.test(l))
      if (arabicLine) return arabicLine.replace(/^-?\s*/, '').trim()
      return rName
    } else {
      if (lower.includes('riyadh') || lower.includes('الرياض')) return 'Riyadh Province'
      if (lower.includes('makkah') || lower.includes('مكة')) return 'Makkah Province'
      if (lower.includes('madinah') || lower.includes('المدينة')) return 'Madinah Province'
      if (lower.includes('tabuk') || lower.includes('تبوك')) return 'Tabuk Province'
      if (lower.includes('eastern') || lower.includes('الشرقية')) return 'Eastern Province'
      if (lower.includes('asir') || lower.includes('عسير')) return 'Asir Province'

      // If multiline, take the first line (usually English)
      const lines = rName.split(/[\r\n]+/)
      const englishLine = lines.find((l) => /[a-zA-Z]/.test(l))
      if (englishLine) return englishLine.replace(/^-?\s*/, '').trim()
      return rName
    }
  }

  // Region markers have been replaced by individual project logo markers

  const createProjectIcon = (project: Project) => {
    const logoSrc = project.logoUrl || '/BinSaedanLogo.png'
    const isSoldOut = !project.hasAvailability && (project.availablePhasesCount ?? 0) === 0
    const actionBg = isSoldOut ? 'rgba(40,40,40,0.9)' : '#e65100'
    const actionText = isSoldOut ? (isRtl ? 'مباع بالكامل' : 'Sold Out') : (isRtl ? 'استكشف' : 'Explore')
    const actionColor = isSoldOut ? '#aaa' : '#fff'

    const html = `
      <div style="
        display: flex;
        flex-direction: column;
        background: rgba(20, 20, 20, 0.92);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 4px;
        overflow: hidden;
        width: 150px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.4);
        font-family: inherit;
        cursor: pointer;
        user-select: none;
      ">
        <div style="display: flex; align-items: center; padding: 6px; gap: 8px;">
          <div style="
            width: 28px;
            height: 28px;
            background: white;
            border-radius: 2px;
            padding: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          ">
            <img src="${logoSrc}" alt="" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='/BinSaedanLogo.png'" />
          </div>
          <div style="
            flex: 1;
            font-size: 10px;
            font-weight: 700;
            color: white;
            line-height: 1.2;
            text-align: ${isRtl ? 'right' : 'left'};
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          ">
            ${isRtl ? project.nameAr : project.name}
          </div>
        </div>
        <div style="
          background: ${actionBg};
          color: ${actionColor};
          font-size: 10px;
          font-weight: 600;
          text-align: center;
          padding: 4px 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">
          ${actionText}
        </div>
      </div>
    `
    return L.divIcon({
      className: 'custom-project-marker',
      html,
      iconSize: [150, 56],
      iconAnchor: [75, 56],
    })
  }

  // Extract all polygon geometries to render background contexts
  const allPolygons = useMemo(() => {
    const list: { rings: LatLngExpression[][]; isSelected: boolean }[] = []
    projects.forEach((p) => {
      const isSelected = selectedRegion
        ? p.provinceRegion?.toLowerCase() === selectedRegion.toLowerCase()
        : true

      if (isPolygon(p.mapGeometryJson)) {
        const rings = p.mapGeometryJson.coordinates.map(ringToLatLngs)
        list.push({ rings, isSelected })
      } else if (isMultiPolygon(p.mapGeometryJson)) {
        p.mapGeometryJson.coordinates.forEach((poly) => {
          const rings = poly.map(ringToLatLngs)
          list.push({ rings, isSelected })
        })
      }
    })
    return list
  }, [projects, selectedRegion])

  // Filter projects to show markers based on selected region (or show all if no region selected)
  const displayedProjects = useMemo(() => {
    if (!selectedRegion) return projectMarkers
    return projectMarkers.filter((p) => p.provinceRegion?.toLowerCase() === selectedRegion.toLowerCase())
  }, [projectMarkers, selectedRegion])

  return (
    <Box sx={{ py: 8, bgcolor: '#f8fafc', position: 'relative' }}>
      <Container maxWidth="xl">
        <Typography
          variant="h2"
          fontWeight="500"
          color="primary.main"
          sx={{
            mb: 4,
            fontSize: { xs: '2rem', md: '2.5rem' },
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          {isRtl ? 'مواقع المشاريع على الخريطة' : 'Explore Projects on Map'}
        </Typography>

        <Paper
          elevation={4}
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 450, md: 600 },
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <MapContainer
            center={[24.7136, 46.6753]}
            zoom={6}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController
              selectedRegion={selectedRegion}
              projects={projectMarkers}
              resetTrigger={resetTrigger}
            />

            {/* Render Region Polygons */}
            {allPolygons.map((item, idx) =>
              item.rings.map((ring, rIdx) => (
                <Polygon
                  key={`${idx}-${rIdx}`}
                  positions={ring}
                  pathOptions={{
                    color: '#e91e63', // Regional boundary highlight
                    weight: item.isSelected ? 2.5 : 1.5,
                    dashArray: '5, 5',
                    fillColor: '#1b5e20', // Forest green shading
                    fillOpacity: item.isSelected ? 0.35 : 0.15,
                  }}
                />
              ))
            )}

            {/* Render all project markers directly with actual project logos */}
            {displayedProjects.map((project) => (
              <Marker
                key={project.id}
                position={[project.renderLat, project.renderLng]}
                icon={createProjectIcon(project)}
                eventHandlers={{
                  click: () => navigate(`/project/${project.id}`),
                }}
              />
            ))}
          </MapContainer>

          {/* Reset Zoom Button Overlay (Bottom Left) */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 24,
              left: 24,
              zIndex: 1000,
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                setSelectedRegion(null)
                setResetTrigger((prev) => prev + 1)
              }}
              sx={{
                bgcolor: '#000',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: 1,
                boxShadow: 4,
                '&:hover': {
                  bgcolor: '#222',
                },
              }}
            >
              {isRtl ? 'إعادة ضبط الخريطة' : 'Reset Zoom'}
            </Button>
          </Box>

          {/* Region Filters Bar Overlay (Bottom Center) */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              display: 'flex',
              gap: 1,
              bgcolor: 'rgba(20, 20, 20, 0.85)',
              backdropFilter: 'blur(12px)',
              p: 0.75,
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {regions.map((regionName) => {
              const isSelected = selectedRegion?.toLowerCase() === regionName.toLowerCase()
              return (
                <Button
                  key={regionName}
                  onClick={() => setSelectedRegion(regionName)}
                  sx={{
                    color: isSelected ? '#e65100' : '#fff',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    px: 2,
                    py: 0.75,
                    borderRadius: 1.5,
                    transition: 'all 0.2s',
                    borderBottom: isSelected ? '2px solid #e65100' : '2px solid transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {getLocalizedRegionName(regionName)}
                </Button>
              )
            })}
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
