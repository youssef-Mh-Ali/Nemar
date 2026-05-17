const { pickId } = require('../lib/sf-pick-id.cjs')

/**
 * Netlify Function: My Opportunities + related Units (SPA)
 *
 * Reads the logged-in contact from `fbs_session` cookie (signed JWT),
 * then queries Salesforce for Opportunities linked to that Contact and Units linked to those Opportunities.
 *
 * Relationship assumption:
 * - Contact ↔ Opportunity via OpportunityContactRole (ContactId) (or fallbacks)
 * - Opportunity has a lookup to Unit__c via Opportunity.Unit__c (and Unit__r)
 *
 * Env:
 * - SALESFORCE_CLIENT_ID / SALESFORCE_CLIENT_SECRET / SALESFORCE_TOKEN_URL / SALESFORCE_INSTANCE_URL
 * - SESSION_JWT_SECRET
 */

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

function parseCookies(cookieHeader) {
  const out = {}
  if (!cookieHeader) return out
  const parts = String(cookieHeader).split(';')
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=')
    if (!k) continue
    out[k] = rest.join('=')
  }
  return out
}

async function getSalesforceAccessToken() {
  const clientId = process.env.SALESFORCE_CLIENT_ID
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET
  const tokenUrl = process.env.SALESFORCE_TOKEN_URL
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL

  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error('Salesforce credentials not configured')
  }

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`Salesforce token request failed (${tokenResponse.status}): ${errorText}`)
  }

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token
  const tokenInstanceUrl = tokenData.instance_url || instanceUrl

  if (!accessToken || !tokenInstanceUrl) {
    throw new Error('Invalid token response from Salesforce')
  }

  return { accessToken, instanceUrl: tokenInstanceUrl }
}

async function sfQuery(instanceUrl, accessToken, soql) {
  console.log('Salesforce SOQL:', soql)
  const url = `${instanceUrl}/services/data/v59.0/query?q=${encodeURIComponent(soql)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = null
  }
  if (!res.ok) {
    const message = body?.[0]?.message || body?.message || text || 'Salesforce query failed'
    const err = new Error(message)
    err.statusCode = res.status
    err.details = body || text
    throw err
  }
  return body
}

function mapUnitRecord(r) {
  return {
    id: r.Id,
    projectId: '',
    phaseId: '',
    unitNumber: r.Name,
    externalId: r.External_ID__c,
    price: Number(r.Price__c || 0),
    finalPrice: r.Final_Price__c ?? undefined,
    status: (r.Status__c || 'Available'),
    bedrooms: Number(r.Number_of_Bedrooms__c || 0),
    bathrooms: r.Number_of_Bathrooms__c ?? undefined,
    area: Number(r.Total_Area__c || 0),
    bua: r.BUA__c ?? undefined,
    floor: r.Floor__c ?? undefined,
    finishing: r.Finishing__c ?? undefined,
    usageType: r.Usage_Type__c ?? undefined,
    view: r.View__c ?? undefined,
    hasGarden: !!r.Has_Garden__c,
    hasLand: !!r.Has_Land__c,
    hasRoof: !!r.Has_Roof__c,
    hasOutdoor: !!r.Has_Outdoor__c,
    gardenArea: r.Garden_Area__c ?? undefined,
    landArea: r.Land_Area__c ?? undefined,
    roofArea: r.Roof_Area__c ?? undefined,
    outdoorArea: r.Outdoor_Area__c ?? undefined,
    eligibleForSubsidies: !!r.Eligible_for_Subsidies__c,
    subsidies: r.Subsidies__c ?? undefined,
    deliveryDate: undefined,
    images: r.Unit_Image__c ? [r.Unit_Image__c] : [],
    unitImage: r.Unit_Image__c ?? undefined,
    notes: undefined,
    paymentProgress: undefined,
    paymentStatus: undefined,
    // optional labels if present (when unit comes from Opportunity.Unit__r)
    projectName: undefined,
    projectNameAr: undefined,
    phaseName: undefined,
    phaseNameAr: undefined,
    buildingName: undefined,
    blockName: undefined,
  }
}

function unitFromOpportunity(opp) {
  const u = opp?.Unit__r
  if (!u || !u.Id) return null
  return mapUnitRecord(u)
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { success: false, error: 'Method not allowed' })
  }

  try {
    const sessionSecret = process.env.SESSION_JWT_SECRET
    if (!sessionSecret) return json(500, { success: false, error: 'SESSION_JWT_SECRET not configured' })

    const cookieHeader = event.headers?.cookie || event.headers?.Cookie || ''
    const cookies = parseCookies(cookieHeader)
    const raw = cookies.fbs_session
    if (!raw) return json(401, { success: false, error: 'Unauthorized' })

    const cookieJwt = decodeURIComponent(raw)
    const { jwtVerify } = await import('jose')
    const secretKey = new TextEncoder().encode(sessionSecret)
    const verified = await jwtVerify(cookieJwt, secretKey, { algorithms: ['HS256'] })
    const contactId = pickId(verified.payload?.sub)
    if (!contactId) return json(401, { success: false, error: 'Unauthorized' })

    const { accessToken, instanceUrl } = await getSalesforceAccessToken()

    const oppSelect = [
      'Id',
      'Name',
      'StageName',
      'CloseDate',
      'Amount',
      'Unit__c',
      // Unit fields (pulled through relationship)
      'Unit__r.Id',
      'Unit__r.Name',
      'Unit__r.External_ID__c',
      'Unit__r.Status__c',
      'Unit__r.Price__c',
      'Unit__r.Final_Price__c',
      'Unit__r.Number_of_Bedrooms__c',
      'Unit__r.Number_of_Bathrooms__c',
      'Unit__r.Total_Area__c',
      'Unit__r.BUA__c',
      'Unit__r.Floor__c',
      'Unit__r.Finishing__c',
      'Unit__r.Usage_Type__c',
      'Unit__r.View__c',
      'Unit__r.Has_Garden__c',
      'Unit__r.Has_Land__c',
      'Unit__r.Has_Roof__c',
      'Unit__r.Has_Outdoor__c',
      'Unit__r.Garden_Area__c',
      'Unit__r.Land_Area__c',
      'Unit__r.Roof_Area__c',
      'Unit__r.Outdoor_Area__c',
      'Unit__r.Eligible_for_Subsidies__c',
      'Unit__r.Subsidies__c',
      'Unit__r.Unit_Image__c',
    ].join(', ')

    // 1) Get opportunities related to contact (via OpportunityContactRole)
    const ocrSoql = `SELECT OpportunityId, Opportunity.Name, Opportunity.StageName, Opportunity.CloseDate, Opportunity.Amount
      FROM OpportunityContactRole
      WHERE ContactId = '${contactId}'
      ORDER BY Opportunity.CloseDate DESC
      LIMIT 50`

    const ocr = await sfQuery(instanceUrl, accessToken, ocrSoql)
    const ocrRecords = ocr.records || []

    const oppById = new Map()
    for (const r of ocrRecords) {
      const oppId = pickId(r.OpportunityId)
      if (!oppId || oppById.has(oppId)) continue
      const opp = r.Opportunity || {}
      oppById.set(oppId, {
        id: oppId,
        name: opp.Name || '',
        stageName: opp.StageName || '',
        closeDate: opp.CloseDate || null,
        amount: opp.Amount ?? null,
        units: [],
      })
    }

    // If we got opp ids from OCR, hydrate them with Unit__r in one query.
    if (oppById.size > 0) {
      const ids = Array.from(oppById.keys()).map((id) => `'${id}'`).join(',')
      const hydrateSoql = `SELECT ${oppSelect} FROM Opportunity WHERE Id IN (${ids})`
      const hydrateRes = await sfQuery(instanceUrl, accessToken, hydrateSoql)
      for (const o of hydrateRes.records || []) {
        const oppId = pickId(o.Id)
        const opp = oppById.get(oppId)
        if (!opp) continue
        const unit = unitFromOpportunity(o)
        if (unit) opp.units.push(unit)
      }
    }

    // Fallback if no OpportunityContactRole exists: query opportunities by contact's AccountId
    if (oppById.size === 0) {
      const contactSoql = `SELECT Id, AccountId FROM Contact WHERE Id = '${contactId}' LIMIT 1`
      const contactRes = await sfQuery(instanceUrl, accessToken, contactSoql)
      const accountId = pickId((contactRes.records || [])[0]?.AccountId)
      if (accountId) {
        const oppSoql = `SELECT ${oppSelect}
          FROM Opportunity
          WHERE AccountId = '${accountId}'
          ORDER BY CloseDate DESC
          LIMIT 50`
        const oppRes = await sfQuery(instanceUrl, accessToken, oppSoql)
        for (const o of oppRes.records || []) {
          const oppId = pickId(o.Id)
          if (!oppId || oppById.has(oppId)) continue
          oppById.set(oppId, {
            id: oppId,
            name: o.Name || '',
            stageName: o.StageName || '',
            closeDate: o.CloseDate || null,
            amount: o.Amount ?? null,
            units: (() => {
              const u = unitFromOpportunity(o)
              return u ? [u] : []
            })(),
          })
        }
      }
    }

    // Fallback #2: query opportunities by Opportunity.ContactId (when enabled in org)
    if (oppById.size === 0) {
      const oppSoql = `SELECT ${oppSelect}
        FROM Opportunity
        WHERE ContactId = '${contactId}'
        ORDER BY CloseDate DESC
        LIMIT 50`
      const oppRes = await sfQuery(instanceUrl, accessToken, oppSoql)
      for (const o of oppRes.records || []) {
        const oppId = pickId(o.Id)
        if (!oppId || oppById.has(oppId)) continue
        oppById.set(oppId, {
          id: oppId,
          name: o.Name || '',
          stageName: o.StageName || '',
          closeDate: o.CloseDate || null,
          amount: o.Amount ?? null,
          units: (() => {
            const u = unitFromOpportunity(o)
            return u ? [u] : []
          })(),
        })
      }
    }

    const oppIds = Array.from(oppById.keys())
    if (oppIds.length === 0) return json(200, { success: true, data: [] })

    return json(200, { success: true, data: Array.from(oppById.values()) })
  } catch (error) {
    console.error('[my-opportunities] error:', error)
    return json(500, { success: false, error: 'Internal server error' })
  }
}

