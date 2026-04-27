import { Unit, Lead, Case, AuthUser, UnitFilters, ApiResponse } from '../types'
import { salesforceQuery, salesforceFetchUnits, SalesforceUnitDTO } from '../salesforce/client'

const BASE_URL = import.meta.env.VITE_API_URL || ''

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, return error response
      return {
        success: false,
        error: 'API endpoint not available',
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    return {
      success: false,
      error: 'Network error or endpoint not available',
    }
  }
}

/**
 * Detect aspect ratio from native video metadata
 * Priority 2: If Aspect_Ratio__c is not available, detect from video element
 * @param videoUrl - URL to the video file (.mp4, .m3u8, etc.)
 * @param videoElement - Optional existing video element to use
 * @returns Promise resolving to aspect ratio (width/height) or null if detection fails
 */
export async function detectVideoAspectRatio(
  videoUrl: string,
  videoElement?: HTMLVideoElement
): Promise<number | null> {
  // Only detect for native video URLs
  const isNativeVideo = /\.(mp4|webm|ogg|m3u8|mov|avi)(\?|$)/i.test(videoUrl) ||
    videoUrl.startsWith('blob:') ||
    videoUrl.startsWith('data:video/')

  if (!isNativeVideo) {
    console.log('[Video Detection] Not a native video URL, skipping detection:', videoUrl)
    return null
  }

  return new Promise((resolve) => {
    const video = videoElement || document.createElement('video')
    let resolved = false

    const cleanup = () => {
      if (!videoElement && video.parentNode) {
        video.parentNode.removeChild(video)
      } else if (!videoElement) {
        video.src = ''
        video.load()
      }
    }

    const finish = (value: number | null) => {
      if (resolved) return
      resolved = true
      clearTimeout(timeout)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('error', handleError)
      cleanup()
      resolve(value)
    }

    const handleLoadedMetadata = () => {
      if (resolved) return

      const width = video.videoWidth
      const height = video.videoHeight

      if (width && height) {
        const aspectRatio = width / height
        console.log('[Video Detection] ✅ Detected aspect ratio:', {
          width,
          height,
          aspectRatio,
        })
        finish(aspectRatio)
      } else {
        console.warn('[Video Detection] ⚠️ Could not get video dimensions')
        finish(null)
      }
    }

    const handleError = () => {
      if (resolved) return
      console.warn('[Video Detection] ⚠️ Error loading video metadata:', videoUrl)
      finish(null)
    }

    // Set timeout to avoid hanging
    const timeout = setTimeout(() => {
      if (resolved) return
      console.warn('[Video Detection] ⚠️ Timeout detecting video aspect ratio')
      finish(null)
    }, 5000)

    video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
    video.addEventListener('error', handleError, { once: true })

    // Set video source
    if (!videoElement) {
      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true
      video.style.position = 'absolute'
      video.style.visibility = 'hidden'
      video.style.width = '1px'
      video.style.height = '1px'
      document.body.appendChild(video)
    }

    video.src = videoUrl
    video.load()
  })
}

interface PWAContent {
  Id: string
  Name: string
  Content_URL__c: string
  Type__c: string
  Location__c: string
  Meta_keywords__c?: string
  Aspect_Ratio__c?: string
}

interface SalesforceProjectRecord {
  Id: string
  Name: string
  City__c?: string
  Province_Region__c?: string
  District__c?: string
  Hero_Image_URL__c?: string
  Logo_URL__c?: string
}

interface SalesforcePhaseRecord {
  Id: string
  Name: string
  Name_Ar__c?: string
  Project__c: string
  Status__c?: string
}

interface SalesforceAvailabilityRecord {
  Phase__c: string
}

// Projects
export async function getProjects() {
  const CACHE_KEY = 'binsaedan_projects_cache'
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Check cache
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      const { timestamp, data } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_TTL) {
        console.log('[Projects] Returning cached data')
        return { success: true, data }
      }
    }
  } catch (e) {
    console.warn('[Projects] Cache parse error', e)
    sessionStorage.removeItem(CACHE_KEY)
  }

  try {
    // Try to fetch from Salesforce first
    console.log('[Projects] Fetching projects from Salesforce...')

    // 1. Fetch Projects
    const projectsQuery = `SELECT Id, Name, City__c, Province_Region__c, District__c, Hero_Image_URL__c, Logo_URL__c
                          FROM Project__c 
                          ORDER BY Name ASC`

    const projectsResult = await salesforceQuery<SalesforceProjectRecord>(projectsQuery)

    const sfProjects = projectsResult.records || []

    if (sfProjects.length === 0) {
      // Salesforce is the only data source; return empty list if no records.
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: [],
        })
      )
      return { success: true, data: [] }
    }

    const projectIds = sfProjects.map((p) => `'${p.Id}'`).join(',')

    // 2. Fetch Phases for these projects
    console.log('[Projects] Fetching phases...')
    const phasesQuery = `SELECT Id, Name, Name_Ar__c, Project__c, Status__c 
                          FROM Phase__c 
                          WHERE Project__c IN (${projectIds})`

    const phasesResult = await salesforceQuery<SalesforcePhaseRecord>(phasesQuery)
    const sfPhases = phasesResult.records || []

    // 3. Fetch Availability (Phases that have available units)
    // We group by Phase__c to get distinct phases with available units
    console.log('[Projects] Fetching availability data...')
    const availabilityQuery = `SELECT Phase__c 
                                FROM Unit__c 
                                WHERE Project__c IN (${projectIds}) 
                                AND Status__c IN ('Available', 'On-Hold') 
                                GROUP BY Phase__c`

    const availabilityResult = await salesforceQuery<SalesforceAvailabilityRecord>(availabilityQuery)
    const availablePhaseIds = new Set((availabilityResult.records || []).map((r) => r.Phase__c))

    // Transform to application format
    const mappedProjects = sfProjects.map((p) => {
      // Get phases for this project
      const projectPhases = sfPhases.filter((phase) => phase.Project__c === p.Id)

      // Map phases and determine availability based on Unit data (availablePhaseIds)
      const mappedPhases = projectPhases.map((phase) => ({
        id: phase.Id,
        projectId: phase.Project__c,
        name: phase.Name,
        nameAr: phase.Name_Ar__c,
        // Phase is available if it is in the availablePhaseIds set (derived from Units)
        status: availablePhaseIds.has(phase.Id) ? 'Available' : 'SoldOut',
        // We can't get exact count without another query, but for now we know it's > 0 if available
        availableUnitsCount: availablePhaseIds.has(phase.Id) ? 1 : 0,
      }))

      const availablePhasesCount = mappedPhases.filter((ph) => ph.status === 'Available').length

      return {
        id: p.Id,
        name: p.Name,
        nameAr: p.Name,
        location: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
        locationAr: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
        coverImageUrl: p.Hero_Image_URL__c || p.Logo_URL__c || '',
        featuredVideoUrl: '',
        status: 'Active',
        phases: mappedPhases,
        // UI Helpers
        hasAvailability: availablePhasesCount > 0,
        availablePhasesCount: availablePhasesCount,
        // Compatibility with older UI fields
        nameEn: p.Name,
        locationEn: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
      }
    })

    console.log('[Projects] ✅ Loaded from Salesforce:', mappedProjects.length)

    // Cache success result
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: mappedProjects,
      })
    )

    return {
      success: true,
      data: mappedProjects,
    }
  } catch (error) {
    console.error('[Projects] ❌ Failed to load from Salesforce:', error)
    return {
      success: false,
      error: 'Failed to load projects from Salesforce',
    }
  }
}

export async function getProject(id: string) {
  console.log('[Project] Fetching project from Salesforce:', id)

  try {
    const projectQuery = `SELECT Id, Name, City__c, Province_Region__c, District__c, Hero_Image_URL__c, Logo_URL__c
                          FROM Project__c 
                          WHERE Id = '${id}'
                          LIMIT 1`

    const projectResult = await salesforceQuery<SalesforceProjectRecord>(projectQuery)
    const p = projectResult.records?.[0]
    if (!p) {
      return { success: false, error: 'Project not found in Salesforce' }
    }

    const phasesQuery = `SELECT Id, Name, Name_Ar__c, Project__c, Status__c 
                          FROM Phase__c 
                          WHERE Project__c = '${id}'`
    const phasesResult = await salesforceQuery<SalesforcePhaseRecord>(phasesQuery)
    const sfPhases = phasesResult.records || []

    const availabilityQuery = `SELECT Phase__c 
                                FROM Unit__c 
                                WHERE Project__c = '${id}'
                                AND Status__c IN ('Available', 'On-Hold') 
                                GROUP BY Phase__c`
    const availabilityResult = await salesforceQuery<SalesforceAvailabilityRecord>(availabilityQuery)
    const availablePhaseIds = new Set((availabilityResult.records || []).map((r) => r.Phase__c))

    const mappedPhases = sfPhases.map((phase) => ({
      id: phase.Id,
      projectId: phase.Project__c,
      name: phase.Name,
      nameAr: phase.Name_Ar__c,
      status: availablePhaseIds.has(phase.Id) ? 'Available' : 'SoldOut',
      availableUnitsCount: availablePhaseIds.has(phase.Id) ? 1 : 0,
    }))
    const availablePhasesCount = mappedPhases.filter((ph) => ph.status === 'Available').length

    return {
      success: true,
      data: {
        id: p.Id,
        name: p.Name,
        nameAr: p.Name,
        location: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
        locationAr: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
        coverImageUrl: p.Hero_Image_URL__c || p.Logo_URL__c || '',
        featuredVideoUrl: '',
        status: 'Active',
        phases: mappedPhases,
        hasAvailability: availablePhasesCount > 0,
        availablePhasesCount,
        nameEn: p.Name,
        locationEn: [p.District__c, p.City__c, p.Province_Region__c].filter(Boolean).join(', '),
      },
    }
  } catch (error) {
    console.error('[Project] ❌ Failed to load project from Salesforce:', error)
    return {
      success: false,
      error: 'Failed to load project from Salesforce',
    }
  }
}

export async function getFeaturedVideo() {
  console.log('[Hero Video] Starting to fetch featured video via Netlify Function...')

  try {
    // Query Salesforce for PWA Content with Location = 'Homepage Hero Section' and Type = 'Video'
    // This now uses Netlify Functions, so secrets are kept server-side
    const soql = `SELECT Id, Name, Content_URL__c, Type__c, Location__c, Meta_keywords__c, Aspect_Ratio__c 
                  FROM PWA_Content__c 
                  WHERE Location__c = 'Homepage Hero Section' 
                  AND Type__c = 'Video' 
                  ORDER BY CreatedDate DESC 
                  LIMIT 1`

    console.log('[Hero Video] Querying Salesforce for hero video record via Netlify Function...')
    const result = await salesforceQuery<PWAContent>(soql)

    if (result.records && result.records.length > 0) {
      const content = result.records[0]
      console.log('[Hero Video] ✅ Found Salesforce record:', {
        id: content.Id,
        name: content.Name,
        type: content.Type__c,
        location: content.Location__c,
        contentUrl: content.Content_URL__c,
      })

      // Extract video URL - handle Instagram, YouTube, Google Drive, and direct video URLs
      let videoUrl = (content.Content_URL__c || '').trim()

      if (!videoUrl) {
        console.warn('[Hero Video] ⚠️ No video URL in Salesforce record')
        // No video URL in record, fall through to API endpoint
        throw new Error('No video URL in Salesforce record')
      }

      console.log('[Hero Video] Processing video URL:', videoUrl)

      // Parse aspect ratio from Salesforce field (Priority 1)
      let aspectRatio: number | undefined = undefined
      if (content.Aspect_Ratio__c) {
        const ratioMatch = content.Aspect_Ratio__c.match(/(\d+):(\d+)/)
        if (ratioMatch) {
          aspectRatio = parseFloat(ratioMatch[1]) / parseFloat(ratioMatch[2])
          console.log('[Hero Video] ✅ Parsed aspect ratio from Salesforce:', {
            raw: content.Aspect_Ratio__c,
            decimal: aspectRatio,
          })
        } else {
          console.warn('[Hero Video] ⚠️ Invalid aspect ratio format:', content.Aspect_Ratio__c)
        }
      }

      // Handle Instagram URLs (reels and posts)
      // Instagram uses official embed script, so we keep the original URL
      // The HeroSection component will handle the Instagram embed differently
      if (videoUrl.includes('instagram.com/reel/') || videoUrl.includes('instagram.com/p/')) {
        // Clean up the URL - remove utm_source and other query params, keep the base URL
        const cleanUrl = videoUrl.split('?')[0]
        videoUrl = cleanUrl
        console.log('[Hero Video] ✅ Prepared Instagram URL for official embed:', videoUrl)
      }
      // Handle Google Drive URLs
      else if (videoUrl.includes('drive.google.com')) {
        // Extract file ID from various Google Drive URL formats
        // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
        // Format: https://drive.google.com/file/d/FILE_ID/view
        // Format: https://drive.google.com/open?id=FILE_ID
        // Format: https://drive.google.com/uc?id=FILE_ID
        let fileId = ''

        // Primary pattern: /file/d/FILE_ID/ (works for /view, /preview, etc.)
        const fileIdMatch = videoUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
        // Fallback patterns
        const openIdMatch = videoUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)
        const ucIdMatch = videoUrl.match(/\/uc\?id=([a-zA-Z0-9_-]+)/)

        fileId = fileIdMatch?.[1] || openIdMatch?.[1] || ucIdMatch?.[1] || ''

        if (fileId) {
          // Convert to embeddable preview URL with autoplay
          // Google Drive preview supports autoplay via URL parameter
          videoUrl = `https://drive.google.com/file/d/${fileId}/preview?autoplay=1&mute=1`
          console.log('[Hero Video] ✅ Converted Google Drive URL to embed with autoplay:', {
            originalUrl: videoUrl,
            fileId: fileId,
            embedUrl: videoUrl,
          })
        } else {
          console.warn('[Hero Video] ⚠️ Could not extract Google Drive file ID from URL:', videoUrl)
        }
      }
      // Handle YouTube URLs
      else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId = ''

        if (videoUrl.includes('youtube.com/watch')) {
          // Format: https://www.youtube.com/watch?v=VIDEO_ID
          videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1] || ''
          console.log('[Hero Video] Extracted YouTube video ID from watch URL:', videoId)
        } else if (videoUrl.includes('youtu.be/')) {
          // Format: https://youtu.be/VIDEO_ID?si=...
          const match = videoUrl.match(/youtu\.be\/([^/?&]+)/)
          videoId = match?.[1] || ''
          console.log('[Hero Video] Extracted YouTube video ID from short URL:', videoId, 'from:', videoUrl)
        } else if (videoUrl.includes('youtube.com/embed/')) {
          // Format: https://www.youtube.com/embed/VIDEO_ID
          videoId = videoUrl.match(/embed\/([^?&]+)/)?.[1] || ''
          console.log('[Hero Video] Extracted YouTube video ID from embed URL:', videoId)
        }

        if (videoId) {
          // Build YouTube embed URL with autoplay and mute
          const params = new URLSearchParams({
            autoplay: '1',
            mute: '1',
            loop: '1',
            playlist: videoId, // Required for looping
            controls: '0',
            showinfo: '0',
            playsinline: '1',
            enablejsapi: '1',
            rel: '0',
            modestbranding: '1',
          })
          videoUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`
          console.log('[Hero Video] ✅ Built YouTube embed URL:', videoUrl)
        } else {
          console.warn('[Hero Video] ⚠️ Could not extract YouTube video ID from URL:', videoUrl)
        }
      }

      // Try to extract thumbnail/cover image
      let coverImageUrl = ''
      if (videoUrl.includes('instagram.com')) {
        // Instagram embed doesn't provide direct thumbnail, use a default gradient
        coverImageUrl = ''
        console.log('[Hero Video] Using default gradient for Instagram cover image')
      } else if (videoUrl.includes('youtube.com/embed/')) {
        // Extract YouTube video ID for thumbnail
        const thumbVideoId = videoUrl.match(/embed\/([^?]+)/)?.[1]
        if (thumbVideoId) {
          coverImageUrl = `https://img.youtube.com/vi/${thumbVideoId}/maxresdefault.jpg`
          console.log('[Hero Video] Generated YouTube thumbnail URL:', coverImageUrl)
        }
      } else if (videoUrl.includes('drive.google.com')) {
        // Google Drive doesn't provide direct thumbnail, use a default gradient
        coverImageUrl = ''
        console.log('[Hero Video] Using default gradient for Google Drive cover image')
      }

      const videoData = {
        projectId: '',
        projectName: content.Name,
        projectNameAr: content.Name,
        videoUrl: videoUrl,
        coverImageUrl: coverImageUrl,
        aspectRatio: aspectRatio,
      }

      console.log('[Hero Video] ✅ Returning video data:', videoData)

      return {
        success: true,
        data: videoData,
      } as ApiResponse<{
        projectId: string
        projectName: string
        projectNameAr: string
        videoUrl: string
        coverImageUrl: string
        aspectRatio?: number
      }>
    } else {
      console.warn('[Hero Video] ⚠️ No records found in Salesforce query result')
    }

  } catch (error) {
    console.error('[Hero Video] ❌ ERROR fetching from Salesforce:', error)
    return {
      success: true,
      data: {
        projectId: '',
        projectName: '',
        projectNameAr: '',
        videoUrl: '',
        coverImageUrl: '',
        aspectRatio: undefined,
      },
    }
  }
}

// Units
function mapSalesforceUnit(sfUnit: SalesforceUnitDTO): Unit {
  return {
    id: sfUnit.id,
    projectId: sfUnit.project?.id || '',
    phaseId: sfUnit.phase?.id || '',
    unitNumber: sfUnit.name,
    externalId: sfUnit.externalId,
    price: sfUnit.price,
    finalPrice: sfUnit.finalPrice,
    status: sfUnit.status as Unit['status'],
    bedrooms: sfUnit.numberOfBedrooms,
    bathrooms: sfUnit.numberOfBathrooms,
    area: sfUnit.totalArea,
    bua: sfUnit.bua,
    floor: sfUnit.floor,
    finishing: sfUnit.finishing,
    usageType: sfUnit.usageType,
    view: sfUnit.view,
    hasGarden: sfUnit.hasGarden,
    hasLand: sfUnit.hasLand,
    hasRoof: sfUnit.hasRoof,
    hasOutdoor: sfUnit.hasOutdoor,
    gardenArea: sfUnit.gardenArea,
    landArea: sfUnit.landArea,
    roofArea: sfUnit.roofArea,
    outdoorArea: sfUnit.outdoorArea,
    eligibleForSubsidies: sfUnit.eligibleForSubsidies,
    subsidies: sfUnit.subsidies,
    images: sfUnit.images,
    unitImage: sfUnit.unitImage,
    projectName: sfUnit.project?.name,
    phaseName: sfUnit.phase?.name,
    buildingName: sfUnit.building?.name,
    blockName: sfUnit.block?.name,
    notes: sfUnit.notes,
  }
}

export async function searchUnits(filters?: UnitFilters) {
  console.log('[Units] Searching units from Salesforce...')

  try {
    const result = await salesforceFetchUnits(filters || {})

    if (result.success && result.data && result.data.units) {
      const mappedUnits = result.data.units.map(mapSalesforceUnit)
      console.log('[Units] ✅ Loaded from Salesforce:', mappedUnits.length)
      return {
        success: true,
        data: mappedUnits,
        pagination: result.data.pagination
      }
    }
  } catch (error) {
    console.error('[Units] ❌ Failed to load from Salesforce:', error)
    return {
      success: false,
      error: 'Failed to load units from Salesforce',
    }
  }
  return {
    success: true,
    data: [],
  }
}

export async function getUnit(id: string) {
  console.log('[Units] Fetching unit details from Salesforce:', id)

  try {
    // We use the search endpoint with searchText matching the ID or Name
    const result = await salesforceFetchUnits({ searchText: id, pageSize: 1 })

    if (result.success && result.data && result.data.units && result.data.units.length > 0) {
      const unit = mapSalesforceUnit(result.data.units[0])

      // Get related units (same project, for example)
      let relatedUnits: Unit[] = []
      if (unit.projectId) {
        const relatedResult = await salesforceFetchUnits({
          projectId: unit.projectId,
          pageSize: 4
        })
        if (relatedResult.success && relatedResult.data?.units) {
          relatedUnits = relatedResult.data.units
            .filter(u => u.id !== id)
            .map(mapSalesforceUnit)
            .slice(0, 3)
        }
      }

      return {
        success: true,
        data: {
          unit,
          relatedUnits
        }
      }
    }
  } catch (error) {
    console.error('[Units] ❌ Failed to load unit from Salesforce:', error)
    return {
      success: false,
      error: 'Failed to load unit from Salesforce',
    }
  }

  return {
    success: false,
    error: 'Unit not found',
  }
}

// Leads
export async function createLead(data: Omit<Lead, 'id' | 'createdAt' | 'source'>) {
  return fetcher<Lead>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Auth
export async function login(username: string, password: string) {
  return fetcher<{ user: AuthUser; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export async function getCurrentUser(token?: string) {
  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return fetcher<AuthUser>('/api/auth/me', { headers })
}

export async function logout() {
  return fetcher<void>('/api/auth/logout', { method: 'POST' })
}

// My Units
export async function getMyUnits(token?: string) {
  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return fetcher<Unit[]>('/api/my-units', { headers })
}

// Cases
export async function getCases(token?: string) {
  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return fetcher<Case[]>('/api/cases', { headers })
}

export async function createCase(
  data: {
    unitId?: string
    subject: string
    category: string
    description: string
  },
  token?: string
) {
  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return fetcher<Case>('/api/cases', {
    method: 'POST',
    body: JSON.stringify(data),
    headers,
  })
}

/**
 * Fetch Google Maps iframe URL from Salesforce PWA Content
 * Location: 'HQ Office'
 * Type: 'iframe element url'
 */
export async function getOfficeMapUrl(): Promise<{ mapUrl: string | null; metaKeywords?: string }> {
  console.log('[Office Map] Starting to fetch office map iframe URL via Netlify Function...')

  try {
    const soql = `SELECT Id, Name, Content_URL__c, Type__c, Location__c, Meta_keywords__c 
                  FROM PWA_Content__c 
                  WHERE Location__c = 'HQ Office' 
                  AND Type__c = 'iframe element url' 
                  ORDER BY CreatedDate DESC 
                  LIMIT 1`

    console.log('[Office Map] Querying Salesforce for office map record via Netlify Function...')
    const result = await salesforceQuery<PWAContent>(soql)

    if (result.records && result.records.length > 0) {
      const content = result.records[0]
      // Get URL exactly as stored, ensuring no double encoding
      let mapUrl = (content.Content_URL__c || '').trim()
      const metaKeywords = content.Meta_keywords__c || undefined

      // Ensure URL is properly formatted (no extra encoding)
      if (mapUrl) {
        // Decode if it's double-encoded, then use as-is
        try {
          const decoded = decodeURIComponent(mapUrl)
          // Only use decoded if it's different and still a valid URL
          if (decoded !== mapUrl && decoded.includes('google.com/maps/embed')) {
            mapUrl = decoded
          }
        } catch {
          // If decoding fails, use original URL - it's already correct
        }
      }

      if (mapUrl) {
        // Validate Google Maps embed URL
        const isGoogleMapsEmbed = mapUrl.includes('google.com/maps/embed')

        if (isGoogleMapsEmbed) {
          // Check if URL has a 'pb' parameter and if it appears complete
          const pbMatch = mapUrl.match(/[?&]pb=([^&]*)/)
          if (pbMatch) {
            const pbValue = pbMatch[1]
            // Google Maps pb parameters typically end with specific patterns
            // If it seems truncated (doesn't end properly), log a warning
            if (pbValue.length < 50 || !pbValue.includes('!')) {
              console.warn('[Office Map] ⚠️ Google Maps pb parameter appears truncated:', {
                pbLength: pbValue.length,
                urlLength: mapUrl.length,
              })
            }
          }

          // Ensure URL is properly encoded
          try {
            // Validate URL format
            new URL(mapUrl)
          } catch (urlError) {
            console.error('[Office Map] ❌ Invalid URL format:', urlError)
            return { mapUrl: null, metaKeywords }
          }
        }

        console.log('[Office Map] ✅ Found Salesforce record with map URL:', {
          id: content.Id,
          name: content.Name,
          location: content.Location__c,
          urlLength: mapUrl.length,
          isGoogleMapsEmbed,
          mapUrlPreview: mapUrl.substring(0, 150) + (mapUrl.length > 150 ? '...' : ''),
          metaKeywords,
        })
        return { mapUrl, metaKeywords }
      } else {
        console.warn('[Office Map] ⚠️ No map URL in Salesforce record')
        return { mapUrl: null, metaKeywords }
      }
    } else {
      console.warn('[Office Map] ⚠️ No records found in Salesforce query result')
      return { mapUrl: null }
    }
  } catch (error) {
    console.error('[Office Map] ❌ ERROR fetching from Salesforce:', error)
    return { mapUrl: null }
  }
}
