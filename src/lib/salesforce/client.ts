/**
 * Salesforce API Client
 * Uses OAuth 2.0 Client Credentials flow for server-to-server authentication
 */

interface SalesforceToken {
  access_token: string;
  instance_url: string;
  token_type: string;
  issued_at: string;
  expires_in?: number;
}

let cachedToken: SalesforceToken | null = null;
let tokenExpiry: number = 0;

/**
 * Get OAuth access token using client credentials flow
 */
export async function getAccessToken(): Promise<SalesforceToken> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < tokenExpiry - 300000) {
    console.log('[Salesforce Auth] Using cached access token');
    return cachedToken;
  }

  // Try VITE_ prefixed first (Vite convention), then fallback to unprefixed (for Netlify)
  const clientId = import.meta.env.VITE_SALESFORCE_CLIENT_ID || import.meta.env.SALESFORCE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SALESFORCE_CLIENT_SECRET || import.meta.env.SALESFORCE_CLIENT_SECRET;
  const tokenUrl = import.meta.env.VITE_SALESFORCE_TOKEN_URL || import.meta.env.SALESFORCE_TOKEN_URL;

  console.log('[Salesforce Auth] Attempting authentication...', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    hasTokenUrl: !!tokenUrl,
    tokenUrl: tokenUrl,
    clientIdSource: import.meta.env.VITE_SALESFORCE_CLIENT_ID ? 'VITE_ prefixed' : import.meta.env.SALESFORCE_CLIENT_ID ? 'unprefixed' : 'not found',
  });

  if (!clientId || !clientSecret || !tokenUrl) {
    console.error('[Salesforce Auth] ❌ FAILED: Credentials not configured', {
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      tokenUrl: !!tokenUrl,
    });
    throw new Error("Salesforce credentials not configured");
  }

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Salesforce Auth] ❌ FAILED:", {
        status: response.status,
        statusText: response.statusText,
        error: error,
      });
      throw new Error(`Failed to authenticate with Salesforce: ${response.status}`);
    }

    const token: SalesforceToken = await response.json();
    
    console.log('[Salesforce Auth] ✅ SUCCESS:', {
      instanceUrl: token.instance_url,
      tokenType: token.token_type,
      expiresIn: token.expires_in,
      scope: token.scope,
    });
    
    // Cache the token (default 2 hour expiry if not specified)
    cachedToken = token;
    tokenExpiry = Date.now() + (token.expires_in || 7200) * 1000;

    return token;
  } catch (error) {
    console.error('[Salesforce Auth] ❌ ERROR:', error);
    throw error;
  }
}

/**
 * Make authenticated request to Salesforce REST API
 */
export async function salesforceRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  const baseUrl = token.instance_url || import.meta.env.VITE_SALESFORCE_INSTANCE_URL;

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Salesforce API error (${endpoint}):`, error);
    throw new Error(`Salesforce API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Query Salesforce using SOQL
 */
export async function salesforceQuery<T>(soql: string): Promise<{ records: T[] }> {
  console.log('[Salesforce Query] Executing SOQL:', soql);
  const encodedQuery = encodeURIComponent(soql);
  try {
    const result = await salesforceRequest<{ records: T[] }>(`/services/data/v59.0/query?q=${encodedQuery}`);
    console.log('[Salesforce Query] ✅ SUCCESS:', {
      recordCount: result.records?.length || 0,
      records: result.records,
    });
    return result;
  } catch (error) {
    console.error('[Salesforce Query] ❌ FAILED:', error);
    throw error;
  }
}

/**
 * Create a record in Salesforce
 */
export async function salesforceCreate(
  objectName: string,
  data: Record<string, unknown>
): Promise<{ id: string; success: boolean }> {
  return salesforceRequest(`/services/data/v59.0/sobjects/${objectName}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update a record in Salesforce
 */
export async function salesforceUpdate(
  objectName: string,
  recordId: string,
  data: Record<string, unknown>
): Promise<void> {
  await salesforceRequest(`/services/data/v59.0/sobjects/${objectName}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

