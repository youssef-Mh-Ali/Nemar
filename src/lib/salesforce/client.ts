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
    return cachedToken;
  }

  const clientId = import.meta.env.VITE_SALESFORCE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SALESFORCE_CLIENT_SECRET;
  const tokenUrl = import.meta.env.VITE_SALESFORCE_TOKEN_URL;

  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error("Salesforce credentials not configured");
  }

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
    console.error("Salesforce auth error:", error);
    throw new Error(`Failed to authenticate with Salesforce: ${response.status}`);
  }

  const token: SalesforceToken = await response.json();
  
  // Cache the token (default 2 hour expiry if not specified)
  cachedToken = token;
  tokenExpiry = Date.now() + (token.expires_in || 7200) * 1000;

  return token;
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
  const encodedQuery = encodeURIComponent(soql);
  return salesforceRequest(`/services/data/v59.0/query?q=${encodedQuery}`);
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

