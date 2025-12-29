/**
 * Salesforce API Client
 * Uses Netlify Functions for server-side authentication and API calls
 * Secrets are kept server-side and never exposed to the client
 */

interface SalesforceQueryResult<T> {
  success: boolean
  records: T[]
  error?: string
}

interface SalesforceCreateResult {
  success: boolean
  id: string
  error?: string
}

/**
 * Query Salesforce using SOQL via Netlify Function
 */
export async function salesforceQuery<T>(soql: string): Promise<{ records: T[] }> {
  console.log('[Salesforce Query] Executing SOQL via Netlify Function:', soql)
  
  try {
    const response = await fetch('/.netlify/functions/salesforce-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ soql }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('[Salesforce Query] ❌ FAILED:', response.status, errorData)
      throw new Error(`Salesforce query failed: ${errorData.error || response.statusText}`)
    }

    const result: SalesforceQueryResult<T> = await response.json()

    if (!result.success) {
      console.error('[Salesforce Query] ❌ FAILED:', result.error)
      throw new Error(result.error || 'Salesforce query failed')
    }

    console.log('[Salesforce Query] ✅ SUCCESS:', {
      recordCount: result.records?.length || 0,
    })

    return {
      records: result.records || [],
    }
  } catch (error) {
    console.error('[Salesforce Query] ❌ ERROR:', error)
    throw error
  }
}

/**
 * Create a record in Salesforce via Netlify Function
 */
export async function salesforceCreate(
  objectName: string,
  data: Record<string, unknown>
): Promise<{ id: string; success: boolean }> {
  console.log(`[Salesforce Create] Creating record in ${objectName} via Netlify Function:`, data)
  
  try {
    const response = await fetch('/.netlify/functions/salesforce-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ objectName, data }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('[Salesforce Create] ❌ FAILED:', response.status, errorData)
      throw new Error(`Salesforce create failed: ${errorData.error || response.statusText}`)
    }

    const result: SalesforceCreateResult = await response.json()

    if (!result.success) {
      console.error('[Salesforce Create] ❌ FAILED:', result.error)
      throw new Error(result.error || 'Salesforce create failed')
    }

    console.log(`[Salesforce Create] ✅ SUCCESS: Record created with ID ${result.id}`)

    return {
      id: result.id,
      success: true,
    }
  } catch (error) {
    console.error(`[Salesforce Create] ❌ ERROR for ${objectName}:`, error)
    throw error
  }
}

/**
 * Update a record in Salesforce via Netlify Function
 * Note: This requires a separate function or can be added to salesforce-create
 */
export async function salesforceUpdate(
  objectName: string,
  recordId: string,
  data: Record<string, unknown>
): Promise<void> {
  console.log(`[Salesforce Update] Updating record ${recordId} in ${objectName} via Netlify Function:`, data)
  
  // For now, we'll use the create function pattern
  // In production, you might want to create a separate salesforce-update function
  // This is a placeholder that throws an error - implement if needed
  throw new Error('salesforceUpdate not yet implemented via Netlify Functions')
}
