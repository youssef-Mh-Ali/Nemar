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
  try {
    // Check if Salesforce credentials are configured
    const clientId = import.meta.env.VITE_SALESFORCE_CLIENT_ID
    const clientSecret = import.meta.env.VITE_SALESFORCE_CLIENT_SECRET
    const tokenUrl = import.meta.env.VITE_SALESFORCE_TOKEN_URL

    if (!clientId || !clientSecret || !tokenUrl) {
      // Credentials not configured, skip Salesforce and go to fallback
      throw new Error('Salesforce credentials not configured')
    }

    // Query Salesforce for PWA Content with Location = 'Homepage Hero Section' and Type = 'Video'
    const soql = `SELECT Id, Name, Content_URL__c, Type__c, Location__c, Meta_keywords__c 
                  FROM PWA_Content__c 
                  WHERE Location__c = 'Homepage Hero Section' 
                  AND Type__c = 'Video' 
                  ORDER BY CreatedDate DESC 
                  LIMIT 1`
    
    const result = await salesforceQuery<PWAContent>(soql)
    
    if (result.records && result.records.length > 0) {
      const content = result.records[0]
      // Extract video URL - handle Instagram embeds and direct video URLs
      let videoUrl = (content.Content_URL__c || '').trim()
      
      if (!videoUrl) {
        // No video URL in record, fall through to API endpoint
        throw new Error('No video URL in Salesforce record')
      }
      
      // If it's an Instagram URL, convert to embed format
      if (videoUrl.includes('instagram.com/reel/') || videoUrl.includes('instagram.com/p/')) {
        const reelId = videoUrl.match(/\/reel\/([^/?]+)/)?.[1] || videoUrl.match(/\/p\/([^/?]+)/)?.[1]
        if (reelId) {
          videoUrl = `https://www.instagram.com/reel/${reelId}/embed/`
        }
      }
      
      // For YouTube URLs, convert to embed format with autoplay and mute
      let videoId = ''
      
      if (videoUrl.includes('youtube.com/watch')) {
        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1] || ''
      } else if (videoUrl.includes('youtu.be/')) {
        // Format: https://youtu.be/VIDEO_ID?si=...
        // Extract video ID from path (before ? or /)
        const match = videoUrl.match(/youtu\.be\/([^/?&]+)/)
        videoId = match?.[1] || ''
      } else if (videoUrl.includes('youtube.com/embed/')) {
        // Format: https://www.youtube.com/embed/VIDEO_ID
        videoId = videoUrl.match(/embed\/([^?&]+)/)?.[1] || ''
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
      }
      
      // Try to extract thumbnail from Instagram or use default
      let coverImageUrl = ''
      if (videoUrl.includes('instagram.com')) {
        // Instagram embed doesn't provide direct thumbnail, use a default gradient
        coverImageUrl = ''
      } else if (videoUrl.includes('youtube.com')) {
        // Extract YouTube video ID for thumbnail
        const videoId = videoUrl.match(/embed\/([^?]+)/)?.[1] || videoUrl.match(/[?&]v=([^&]+)/)?.[1]
        if (videoId) {
          coverImageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }
      }
      
      return {
        success: true,
        data: {
          projectId: '',
          projectName: content.Name,
          projectNameAr: content.Name,
          videoUrl: videoUrl,
          coverImageUrl: coverImageUrl,
        },
      } as ApiResponse<{
        projectId: string
        projectName: string
        projectNameAr: string
        videoUrl: string
        coverImageUrl: string
      }>
    }
    
    // Fallback to API endpoint if no Salesforce record found
    const fallback = await fetcher<{
      projectId: string
      projectName: string
      projectNameAr: string
      videoUrl: string
      coverImageUrl: string
    }>('/api/projects/featured-video')
    
    // If API endpoint also fails, return empty data (no video)
    if (!fallback.success) {
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
    
    return fallback
  } catch (error) {
    // Only log if it's not a credentials error (expected in production without env vars)
    if (!(error instanceof Error && error.message.includes('credentials not configured'))) {
      console.error('Error fetching featured video from Salesforce:', error)
    }
    
    // Fallback to API endpoint on error
    const fallback = await fetcher<{
      projectId: string
      projectName: string
      projectNameAr: string
      videoUrl: string
      coverImageUrl: string
    }>('/api/projects/featured-video')
    
    // If API endpoint also fails, return empty data (no video)
    if (!fallback.success) {
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
