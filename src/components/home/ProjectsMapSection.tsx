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
  projects: Project[]
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
      if (typeof p.mapCentroidLat === 'number' && typeof p.mapCentroidLng === 'number') {
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
          setProjects(res.data)
        }
      } catch (err) {
        console.error('Error loading projects map data:', err)
      }
    }
    loadProjects()
  }, [])

  const isRtl = i18n.language === 'ar'

  // Extract unique regions, defaulting to those shown in UI/UX if data is sparse
  const regions = useMemo(() => {
    const found = Array.from(new Set(projects.map((p) => p.provinceRegion).filter((r): r is string => !!r)))
    const standard = ['North Coast', 'West Cairo', 'East Cairo']
    // Ensure standard regions are always present for complete visual match with screenshots
    standard.forEach((r) => {
      if (!found.some((fr) => fr.toLowerCase() === r.toLowerCase())) {
        found.push(r)
      }
    })
    return found
  }, [projects])

  // Group projects by region for Region Summary Markers when no region is selected
  const regionSummaries = useMemo(() => {
    return regions.map((regionName) => {
      const regionProjects = projects.filter((p) => p.provinceRegion?.toLowerCase() === regionName.toLowerCase())
      let latSum = 0
      let lngSum = 0
      let count = 0

      regionProjects.forEach((p) => {
        if (typeof p.mapCentroidLat === 'number' && typeof p.mapCentroidLng === 'number') {
          latSum += p.mapCentroidLat
          lngSum += p.mapCentroidLng
          count++
        } else if (isPolygon(p.mapGeometryJson) && p.mapGeometryJson.coordinates[0]?.[0]) {
          latSum += p.mapGeometryJson.coordinates[0][0][1]
          lngSum += p.mapGeometryJson.coordinates[0][0][0]
          count++
        }
      })

      // Default fallback coordinates matching standard regions if no projects exist in them yet
      let lat = 30.0444
      let lng = 31.2357
      if (count > 0) {
        lat = latSum / count
        lng = lngSum / count
      } else {
        if (regionName.toLowerCase().includes('north coast')) {
          lat = 30.82
          lng = 28.95
        } else if (regionName.toLowerCase().includes('west cairo')) {
          lat = 30.01
          lng = 30.98
        } else if (regionName.toLowerCase().includes('east cairo')) {
          lat = 30.05
          lng = 31.45
        }
      }

      return {
        name: regionName,
        lat,
        lng,
      }
    })
  }, [regions, projects])

  // Custom marker icon creation helpers
  const createRegionIcon = (regionName: string) => {
    const html = `
      <div style="
        background: rgba(20, 20, 20, 0.9);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        padding: 6px 12px;
        color: white;
        text-align: center;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        font-family: inherit;
        cursor: pointer;
        user-select: none;
        min-width: 100px;
      ">
        <div style="font-weight: 700; font-size: 12px; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
          🏢 <span>${regionName}</span>
        </div>
        <div style="
          border-top: 1px solid #e65100;
          padding-top: 4px;
          font-size: 10px;
          color: #e65100;
          font-weight: 600;
          text-transform: uppercase;
        ">
          Show
        </div>
      </div>
    `
    return L.divIcon({
      className: 'custom-region-marker',
      html,
      iconSize: [120, 50],
      iconAnchor: [60, 25],
    })
  }

  const createProjectIcon = (project: Project) => {
    const logoSrc = project.logoUrl || '/BinSaedanLogo.png'
    const isSoldOut = !project.hasAvailability && (project.availablePhasesCount ?? 0) === 0
    const actionBg = isSoldOut ? 'rgba(40,40,40,0.9)' : '#e65100'
    const actionText = isSoldOut ? 'Sold Out' : 'Explore'
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

  // Filter projects to show detail markers for the selected region
  const activeProjects = useMemo(() => {
    if (!selectedRegion) return []
    return projects.filter((p) => p.provinceRegion?.toLowerCase() === selectedRegion.toLowerCase())
  }, [projects, selectedRegion])

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
            center={[30.0444, 31.2357]}
            zoom={8}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController
              selectedRegion={selectedRegion}
              projects={projects}
              resetTrigger={resetTrigger}
            />

            {/* Render Region Polygons */}
            {allPolygons.map((item, idx) =>
              item.rings.map((ring, rIdx) => (
                <Polygon
                  key={`${idx}-${rIdx}`}
                  positions={ring}
                  pathOptions={{
                    color: '#e91e63', // Pinkish-magenta border like Screenshot 1
                    weight: item.isSelected ? 2.5 : 1.5,
                    dashArray: '5, 5',
                    fillColor: '#1b5e20', // Forest green shading
                    fillOpacity: item.isSelected ? 0.35 : 0.15,
                  }}
                />
              ))
            )}

            {/* When no region selected, show high-level Region Summary Markers */}
            {!selectedRegion &&
              regionSummaries.map((reg) => (
                <Marker
                  key={reg.name}
                  position={[reg.lat, reg.lng]}
                  icon={createRegionIcon(reg.name)}
                  eventHandlers={{
                    click: () => setSelectedRegion(reg.name),
                  }}
                />
              ))}

            {/* When a region is selected, show individual Project Detail Markers */}
            {selectedRegion &&
              activeProjects.map((project) => {
                let lat = project.mapCentroidLat
                let lng = project.mapCentroidLng

                if (typeof lat !== 'number' || typeof lng !== 'number') {
                  if (isPolygon(project.mapGeometryJson) && project.mapGeometryJson.coordinates[0]?.[0]) {
                    lat = project.mapGeometryJson.coordinates[0][0][1]
                    lng = project.mapGeometryJson.coordinates[0][0][0]
                  }
                }

                if (typeof lat !== 'number' || typeof lng !== 'number') return null

                return (
                  <Marker
                    key={project.id}
                    position={[lat, lng]}
                    icon={createProjectIcon(project)}
                    eventHandlers={{
                      click: () => navigate(`/project/${project.id}`),
                    }}
                  />
                )
              })}
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
              Reset Zoom
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
                  {regionName}
                </Button>
              )
            })}
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
