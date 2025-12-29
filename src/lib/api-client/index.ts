import { Project, Unit, Lead, Case, AuthUser, UnitFilters, ApiResponse } from '../types'
import { salesforceQuery } from '../salesforce/client'

const BASE_URL = import.meta.env.VITE_API_URL || ''

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const data = await response.json()
  return data
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
  return fetcher<(Project & { hasAvailability: boolean })[]>('/api/projects')
}

export async function getProject(id: string) {
  return fetcher<Project & { hasAvailability: boolean }>(`/api/projects/${id}`)
}

export async function getFeaturedVideo() {
  try {
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
      let videoUrl = content.Content_URL__c
      
      // If it's an Instagram URL, convert to embed format
      if (videoUrl.includes('instagram.com/reel/') || videoUrl.includes('instagram.com/p/')) {
        const reelId = videoUrl.match(/\/reel\/([^/?]+)/)?.[1] || videoUrl.match(/\/p\/([^/?]+)/)?.[1]
        if (reelId) {
          videoUrl = `https://www.instagram.com/reel/${reelId}/embed/`
        }
      }
      
      // For YouTube URLs, convert to embed format
      if (videoUrl.includes('youtube.com/watch')) {
        const videoId = videoUrl.match(/[?&]v=([^&]+)/)?.[1]
        if (videoId) {
          videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0`
        }
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.match(/youtu\.be\/([^/?]+)/)?.[1]
        if (videoId) {
          videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0`
        }
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
    return fetcher<{
      projectId: string
      projectName: string
      projectNameAr: string
      videoUrl: string
      coverImageUrl: string
    }>('/api/projects/featured-video')
  } catch (error) {
    console.error('Error fetching featured video from Salesforce:', error)
    // Fallback to API endpoint on error
    return fetcher<{
      projectId: string
      projectName: string
      projectNameAr: string
      videoUrl: string
      coverImageUrl: string
    }>('/api/projects/featured-video')
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
