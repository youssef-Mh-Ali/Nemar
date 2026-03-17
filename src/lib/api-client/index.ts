import { Project, Unit, Lead, Case, AuthUser, UnitFilters, ApiResponse } from '../types'
import { salesforceQuery } from '../salesforce/client'
import { salesforceQuery } from '../salesforce/client'
import { mockProjects } from '../mock-data/projects'
import { searchUnits as searchMockUnits, getUnitById, getRelatedUnits } from '../mock-data/units'

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
    const projectsQuery = `SELECT Id, Name, Name_Ar__c, Location__c, Location_Ar__c, 
                          Cover_Image_URL__c, Featured_Video_URL__c, Status__c, 
                          Description__c, Description_Ar__c 
                          FROM Project__c 
                          ORDER BY Name ASC`

    const projectsResult = await salesforceQuery<any>(projectsQuery)

    if (projectsResult.records && projectsResult.records.length > 0) {
      const sfProjects = projectsResult.records
      const projectIds = sfProjects.map((p) => `'${p.Id}'`).join(',')

      // 2. Fetch Phases for these projects
      console.log('[Projects] Fetching phases...')
      const phasesQuery = `SELECT Id, Name, Name_Ar__c, Project__c, Status__c 
                          FROM Phase__c 
                          WHERE Project__c IN (${projectIds})`

      const phasesResult = await salesforceQuery<any>(phasesQuery)
      const sfPhases = phasesResult.records || []

      // 3. Fetch Availability (Phases that have available units)
      // We group by Phase__c to get distinct phases with available units
      console.log('[Projects] Fetching availability data...')
      const availabilityQuery = `SELECT Phase__c 
                                FROM Unit__c 
                                WHERE Project__c IN (${projectIds}) 
                                AND Status__c IN ('Available', 'On-Hold') 
                                GROUP BY Phase__c`

      const availabilityResult = await salesforceQuery<any>(availabilityQuery)
      const availablePhaseIds = new Set((availabilityResult.records || []).map((r: any) => r.Phase__c))

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

        const availablePhasesCount = mappedPhases.filter((ph: any) => ph.status === 'Available').length

        return {
          id: p.Id,
          name: p.Name,
          nameAr: p.Name_Ar__c || p.Name,
          location: p.Location__c,
          locationAr: p.Location_Ar__c || p.Location__c,
          coverImageUrl: p.Cover_Image_URL__c || '',
          featuredVideoUrl: p.Featured_Video_URL__c || '',
          status: p.Status__c || 'Active',
          description: p.Description__c,
          descriptionAr: p.Description_Ar__c,
          phases: mappedPhases,
          // UI Helpers
          hasAvailability: availablePhasesCount > 0,
          availablePhasesCount: availablePhasesCount,
        }
      })

      console.log('[Projects] ✅ Loaded from Salesforce:', mappedProjects.length)

      // Cache success result
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: mappedProjects
      }))

      return {
        success: true,
        data: mappedProjects,
      }
    }
  } catch (error) {
    console.warn('[Projects] ⚠️ Failed to load from Salesforce, falling back to mocks:', error)
  }

  const result = await fetcher<(Project & { hasAvailability: boolean })[]>('/api/projects')

  // If API endpoint fails, return mock data as fallback
  if (!result.success || !result.data || result.data.length === 0) {
    // Transform mock projects to include availability info
    const projectsWithAvailability = mockProjects.map((project) => ({
      ...project,
      hasAvailability: project.phases.some((phase) => phase.status === 'Available'),
      availablePhasesCount: project.phases.filter((phase) => phase.status === 'Available').length,
    }))

    return {
      success: true,
      data: projectsWithAvailability,
    }
  }

  return result
}

export async function getProject(id: string) {
  return fetcher<Project & { hasAvailability: boolean }>(`/api/projects/${id}`)
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

    // Fallback to API endpoint if no Salesforce record found
    console.log('[Hero Video] No Salesforce record found, trying API endpoint fallback...')
    const fallback = await fetcher<{
      projectId: string
      projectName: string
      projectNameAr: string
      videoUrl: string
      coverImageUrl: string
      aspectRatio?: number
    }>('/api/projects/featured-video')

    // If API endpoint also fails, return empty data (no video)
    if (!fallback.success) {
      console.warn('[Hero Video] ⚠️ API endpoint also failed, returning empty video data')
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

    console.log('[Hero Video] ✅ Using API endpoint fallback data:', fallback.data)
    return fallback
  } catch (error) {
    console.error('[Hero Video] ❌ ERROR fetching from Salesforce:', error)

    // Fallback to API endpoint on error
    console.log('[Hero Video] Attempting API endpoint fallback...')
    const fallback = await fetcher<{
      projectId: string
      projectName: string
      projectNameAr: string
      videoUrl: string
      coverImageUrl: string
      aspectRatio?: number
    }>('/api/projects/featured-video')

    // If API endpoint also fails, return empty data (no video)
    if (!fallback.success) {
      console.warn('[Hero Video] ⚠️ API endpoint fallback also failed, returning empty video data')
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

    console.log('[Hero Video] ✅ Using API endpoint fallback data:', fallback.data)
    return fallback
  }
}

// Units
export async function searchUnits(filters?: UnitFilters) {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })
  }
  const query = params.toString() ? `?${params.toString()}` : ''
  const result = await fetcher<Unit[]>(`/api/units${query}`)

  // Fallback to mock data if API fails or returns no data
  if (!result.success || !result.data || result.data.length === 0) {
    return {
      success: true,
      data: searchMockUnits(filters || {}),
    }
  }

  return result
}

export async function getUnit(id: string) {
  const result = await fetcher<{ unit: Unit; relatedUnits: Unit[] }>(`/api/units/${id}`)

  // Fallback to mock data if API fails
  if (!result.success || !result.data) {
    const unit = getUnitById(id)
    if (unit) {
      return {
        success: true,
        data: {
          unit,
          relatedUnits: getRelatedUnits(id, 3),
        },
      }
    }
    return {
      success: false,
      error: 'Unit not found',
    }
  }

  return result
}

// Leads
export async function createLead(data: Omit<Lead, 'id' | 'createdAt' | 'source'>) {
  return fetcher<Lead>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Auth
export async function login(username: string, _password: string) {
  // Always login as Aamer Galal regardless of credentials
  const mockedUser: AuthUser = {
    id: 'user-aamer-galal',
    username: username || 'aamer',
    firstName: 'Aamer',
    lastName: 'Galal',
    email: 'aamer.galal@example.com',
    phone: '+966500000000'
  }

  return {
    success: true,
    data: {
      user: mockedUser,
      token: 'mock-jwt-token-aamer-galal',
    },
  } as ApiResponse<{ user: AuthUser; token: string }>
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
export async function getMyUnits(_token?: string) {
  // Return mocked units for Aamer Galal based on user request
  const mockOwnedUnits: Unit[] = [
    {
      id: "owned-unit-1",
      projectId: "future-city",
      phaseId: "fc-phase-1",
      unitNumber: "V-101 (Fully Paid)",
      price: 3500000,
      bedrooms: 5,
      bathrooms: 6,
      area: 450,
      status: "Reserved",
      deliveryDate: "2026-12-01",
      images: [
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
      ],
      projectName: "Future City",
      projectNameAr: "مدينة المستقبل",
      phaseName: "Phase 1 - Residential Villas",
      phaseNameAr: "المرحلة الأولى - فلل سكنية",
      paymentPlan: {
        percentagePaid: 100,
        status: "Fully Paid"
      }
    },
    {
      id: "owned-unit-2",
      projectId: "riyadh-grove",
      phaseId: "rg-phase-1",
      unitNumber: "A-501 (Installments)",
      price: 1200000,
      bedrooms: 3,
      bathrooms: 3,
      area: 165,
      status: "Reserved",
      deliveryDate: "2025-08-01",
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      ],
      projectName: "Riyadh Grove",
      projectNameAr: "رياض غروف",
      phaseName: "Phase 1 - Luxury Apartments",
      phaseNameAr: "المرحلة الأولى - شقق فاخرة",
      paymentPlan: {
        percentagePaid: 60,
        installmentsRemaining: 8,
        hasMaintenanceCheque: true,
        status: "Partial"
      }
    }
  ];

  return {
    success: true,
    data: mockOwnedUnits
  } as ApiResponse<Unit[]>
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
