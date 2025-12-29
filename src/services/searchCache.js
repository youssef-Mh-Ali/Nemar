/**
 * Search Cache Service
 * Provides caching layer for search results
 */

import preferenceMemory from './preferenceMemory'

class SearchCacheService {
  get(key) {
    return preferenceMemory.recall(key)
  }

  set(key, value, ttl = 300000) {
    // 5 minutes default TTL
    preferenceMemory.remember({ key, value, ttl })
  }

  clear() {
    // Clear all cache entries
    preferenceMemory.cleanup()
  }

  clearPattern(pattern) {
    // Clear cache entries matching pattern
    const regex = new RegExp(pattern)
    // Access storage through a method instead of direct property
    preferenceMemory.clearPattern(regex)
  }
}

export default new SearchCacheService()

