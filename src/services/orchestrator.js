/**
 * AI Orchestrator Service
 * Coordinates between different services for intelligent interactions
 */

class Orchestrator {
  constructor() {
    this.services = new Map()
  }

  registerService(name, service) {
    this.services.set(name, service)
  }

  async execute(action, context) {
    try {
      // Route to appropriate service based on action
      switch (action) {
        case 'search':
          return await this.services.get('productSearch')?.search(context)
        case 'remember':
          return await this.services.get('preferenceMemory')?.remember(context)
        case 'getCache':
          return await this.services.get('searchCache')?.get(context)
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    } catch (error) {
      console.error('Orchestrator error:', error)
      throw error
    }
  }
}

export default new Orchestrator()

