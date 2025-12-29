/**
 * Preference Memory Service
 * Stores and retrieves user preferences and search history
 */

class PreferenceMemoryService {
  constructor() {
    this.storage = new Map()
    this.preferences = new Map()
  }

  remember({ key, value, ttl }) {
    const expiry = ttl ? Date.now() + ttl : null
    this.storage.set(key, { value, expiry })
    
    // Clean up expired entries
    this.cleanup()
  }

  recall(key) {
    const entry = this.storage.get(key)
    if (!entry) return null

    if (entry.expiry && Date.now() > entry.expiry) {
      this.storage.delete(key)
      return null
    }

    return entry.value
  }

  savePreference(userId, preference) {
    const userPrefs = this.preferences.get(userId) || {}
    this.preferences.set(userId, { ...userPrefs, ...preference })
    
    // Persist to localStorage
    try {
      localStorage.setItem(`prefs_${userId}`, JSON.stringify(this.preferences.get(userId)))
    } catch (e) {
      console.warn('Failed to save preferences to localStorage:', e)
    }
  }

  getPreference(userId) {
    // Try memory first
    if (this.preferences.has(userId)) {
      return this.preferences.get(userId)
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem(`prefs_${userId}`)
      if (stored) {
        const prefs = JSON.parse(stored)
        this.preferences.set(userId, prefs)
        return prefs
      }
    } catch (e) {
      console.warn('Failed to load preferences from localStorage:', e)
    }

    return null
  }

  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.storage.entries()) {
      if (entry.expiry && now > entry.expiry) {
        this.storage.delete(key)
      }
    }
  }

  clearPattern(regex) {
    for (const key of this.storage.keys()) {
      if (regex.test(key)) {
        this.storage.delete(key)
      }
    }
  }
}

export default new PreferenceMemoryService()

