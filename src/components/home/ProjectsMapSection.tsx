import { useEffect, useState, useMemo } from 'react'
import { Box, Container, Typography, Button, Paper } from '@mui/material'
import { MapContainer, TileLayer, Marker, Polygon, Tooltip, useMap } from 'react-leaflet'
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

function createMapPinIcon(fill: string) {
  return L.divIcon({
    className: 'project-map-pin',
    html: `
      <div style="display:flex;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="${fill}" stroke="rgba(255,255,255,0.85)" stroke-width="1.5"/>
          <circle cx="16" cy="15" r="5" fill="white" fill-opacity="0.95"/>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    tooltipAnchor: [0, -36],
  })
}

const availablePinIcon = createMapPinIcon('#e65100')
const soldOutPinIcon = createMapPinIcon('#6b7280')

function getProjectPinIcon(project: Project) {
  const isSoldOut = !project.hasAvailability && (project.availablePhasesCount ?? 0) === 0
  return isSoldOut ? soldOutPinIcon : availablePinIcon
}

type POIType = 'airport' | 'hospital' | 'university' | 'school'

function createPOIPinIcon(type: POIType) {
  let svgPath = '';
  let bgColor = '#1a365d'; // default dark blue for airport
  
  switch (type) {
    case 'airport':
      svgPath = '<path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="white"/>';
      break;
    case 'hospital':
      bgColor = '#d32f2f'; // Red
      svgPath = '<path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM13 17H11V13H7V11H11V7H13V11H17V13H13V17Z" fill="white"/>';
      break;
    case 'university':
      bgColor = '#388e3c'; // Green
      svgPath = '<path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9Z" fill="white"/>';
      break;
    case 'school':
      bgColor = '#f57c00'; // Orange
      svgPath = '<path d="M12 3L2 12H5V21H19V12H22L12 3ZM12 7.7C13.27 7.7 14.3 8.73 14.3 10C14.3 11.27 13.27 12.3 12 12.3C10.73 12.3 9.7 11.27 9.7 10C9.7 8.73 10.73 7.7 12 7.7ZM16 19H8V15C8 13.68 10.66 13 12 13C13.34 13 16 15V19Z" fill="white"/>';
      break;
  }

  return L.divIcon({
    className: 'poi-map-pin',
    html: `
      <div style="display:flex;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="background:${bgColor};border-radius:50%;padding:4px;border:2px solid white;">
          ${svgPath}
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    tooltipAnchor: [0, -14],
  })
}

// Pre-create icons to avoid recreating on each render
const icons = {
  airport: createPOIPinIcon('airport'),
  hospital: createPOIPinIcon('hospital'),
  university: createPOIPinIcon('university'),
  school: createPOIPinIcon('school'),
}

const POIs: Array<{ id: string, lat: number, lng: number, nameAr: string, nameEn: string, type: POIType }> = [
  // Airports
  { id: 'ruh-airport', lat: 24.9576, lng: 46.6988, nameAr: 'مطار الملك خالد الدولي', nameEn: 'King Khalid International Airport', type: 'airport' },
  { id: 'jed-airport', lat: 21.6702, lng: 39.1565, nameAr: 'مطار الملك عبدالعزيز الدولي', nameEn: 'King Abdulaziz International Airport', type: 'airport' },
  { id: 'dmm-airport', lat: 26.4712, lng: 49.7979, nameAr: 'مطار الملك فهد الدولي', nameEn: 'King Fahd International Airport', type: 'airport' },
  
  // Big Shot Hospitals
  { id: 'ruh-hospital-1', lat: 24.6725, lng: 46.6783, nameAr: 'مستشفى الملك فيصل التخصصي (الرياض)', nameEn: 'King Faisal Specialist Hospital (Riyadh)', type: 'hospital' },
  { id: 'jed-hospital-1', lat: 21.5642, lng: 39.1670, nameAr: 'مستشفى الملك فيصل التخصصي (جدة)', nameEn: 'King Faisal Specialist Hospital (Jeddah)', type: 'hospital' },
  
  // Big Shot Universities
  { id: 'ruh-uni-1', lat: 24.7170, lng: 46.6231, nameAr: 'جامعة الملك سعود', nameEn: 'King Saud University', type: 'university' },
  { id: 'jed-uni-1', lat: 21.4925, lng: 39.2458, nameAr: 'جامعة الملك عبدالعزيز', nameEn: 'King Abdulaziz University', type: 'university' },
  { id: 'dmm-uni-1', lat: 26.3073, lng: 50.1479, nameAr: 'جامعة الملك فهد للبترول والمعادن', nameEn: 'KFUPM', type: 'university' },
  
  // Big Shot Schools
  { id: 'ruh-school-1', lat: 24.8116, lng: 46.5168, nameAr: 'مدارس مسك', nameEn: 'Misk Schools', type: 'school' },
  { id: 'jed-school-1', lat: 21.5034, lng: 39.2003, nameAr: 'مدارس دار الفكر', nameEn: 'Dar Al Fikr Schools', type: 'school' },
]


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

            {displayedProjects.map((project) => {
              const isSoldOut = !project.hasAvailability && (project.availablePhasesCount ?? 0) === 0
              const projectName = isRtl ? project.nameAr : project.name
              const statusLabel = isSoldOut
                ? isRtl
                  ? 'مباع بالكامل'
                  : 'Sold Out'
                : isRtl
                  ? 'استكشف'
                  : 'Explore'

              return (
                <Marker
                  key={project.id}
                  position={[project.renderLat, project.renderLng]}
                  icon={getProjectPinIcon(project)}
                  eventHandlers={{
                    click: () => navigate(`/project/${project.id}`),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -36]} opacity={0.95}>
                    <span style={{ fontWeight: 600 }}>{projectName}</span>
                    <br />
                    <span style={{ fontSize: 11, opacity: 0.85 }}>{statusLabel}</span>
                  </Tooltip>
                </Marker>
              )
            })}

            {/* POI Markers */}
            {(!selectedRegion || selectedRegion === '') && POIs.map((poi) => (
              <Marker
                key={poi.id}
                position={[poi.lat, poi.lng]}
                icon={icons[poi.type]}
                zIndexOffset={100} // Keep POIs above standard pins
              >
                <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
                  <span style={{ fontWeight: 600 }}>{isRtl ? poi.nameAr : poi.nameEn}</span>
                </Tooltip>
              </Marker>
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
