import { Project, Unit, Lead, Case, AuthUser, UnitFilters, ApiResponse } from '../types'
import { salesforceQuery } from '../salesforce/client'
import { mockProjects } from '../mock-data/projects'

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

interface PWAContent {
  Id: string
  Name: string
  Content_URL__c: string
  Type__c: string
  Location__c: string
  Meta_keywords__c?: string
}

// Projects
export async function getProjects() {
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
    const soql = `SELECT Id, Name, Content_URL__c, Type__c, Location__c, Meta_keywords__c 
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
        // Format: https://drive.google.com/file/d/FILE_ID/view
        // Format: https://drive.google.com/open?id=FILE_ID
        // Format: https://drive.google.com/uc?id=FILE_ID
        let fileId = ''
        
        const fileIdMatch = videoUrl.match(/\/file\/d\/([^/]+)/)
        const openIdMatch = videoUrl.match(/[?&]id=([^&]+)/)
        const ucIdMatch = videoUrl.match(/\/uc\?id=([^&]+)/)
        
        fileId = fileIdMatch?.[1] || openIdMatch?.[1] || ucIdMatch?.[1] || ''
        
        if (fileId) {
          // Convert to embeddable preview URL with autoplay
          // Google Drive preview supports autoplay via URL parameter
          videoUrl = `https://drive.google.com/file/d/${fileId}/preview?autoplay=1&mute=1`
          console.log('[Hero Video] ✅ Converted Google Drive URL to embed with autoplay:', videoUrl)
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
  return fetcher<Unit[]>(`/api/units${query}`)
}

export async function getUnit(id: string) {
  return fetcher<{ unit: Unit; relatedUnits: Unit[] }>(`/api/units/${id}`)
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
