/**
 * Product Search Service
 * Handles intelligent product/unit search with caching and preferences
 */

import orchestrator from './orchestrator'
import { searchUnits } from '../lib/api-client'

class ProductSearchService {
  async search(filters, useCache = true) {
    try {
      // Check cache first if enabled
      if (useCache) {
        const cached = await orchestrator.execute('getCache', { key: `search_${JSON.stringify(filters)}` })
        if (cached) {
          return cached
        }
      }

      // Perform search
      const response = await searchUnits(filters)

      if (response.success && response.data) {
        // Cache results
        await orchestrator.execute('remember', {
          key: `search_${JSON.stringify(filters)}`,
          value: response.data,
          ttl: 300000, // 5 minutes
        })

        return response.data
      }

      return []
    } catch (error) {
      console.error('Product search error:', error)
      throw error
    }
  }

  async searchByPreferences(userPreferences) {
    // Use user preferences to enhance search
    const filters = {
      ...userPreferences.favoriteBedrooms && { bedrooms: userPreferences.favoriteBedrooms },
      ...userPreferences.maxPrice && { maxPrice: userPreferences.maxPrice },
      ...userPreferences.preferredProjects && { projectId: userPreferences.preferredProjects[0] },
    }

    return this.search(filters)
  }
}

export default new ProductSearchService()

