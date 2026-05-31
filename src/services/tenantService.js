import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import env from '../config/env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const tenantsFilePath = path.resolve(__dirname, '../../tenants.json')

const normalizeTenant = (tenant = {}) => ({
   tenantKey: tenant.tenantKey || tenant.phoneNumberId || tenant.phone_number_id || 'default',
   phoneNumberId: tenant.phoneNumberId || tenant.phone_number_id || env.phoneNumberId || null,
   whatsappAccessToken: tenant.whatsappAccessToken || tenant.accessToken || tenant.aksesToken || env.akseToken || null,
   aiRagBaseUrl: tenant.aiRagBaseUrl || env.aiRagBaseUrl,
   aiUsername: tenant.aiUsername || tenant.username || env.aiUsername || null,
   aiPassword: tenant.aiPassword || tenant.password || env.aiPassword || null,
   aiGrantType: tenant.aiGrantType || env.aiGrantType,
   aiScope: tenant.aiScope || env.aiScope,
   aiClientId: tenant.aiClientId || env.aiClientId,
   aiClientSecret: tenant.aiClientSecret ?? env.aiClientSecret
})

const parseTenantsFromFile = () => {
   if (!fs.existsSync(tenantsFilePath)) {
      return []
   }

   try {
      const raw = fs.readFileSync(tenantsFilePath, 'utf8')
      const parsed = JSON.parse(raw)

      if (!Array.isArray(parsed)) {
         console.error('❌ tenants.json harus berisi array tenant')
         return []
      }

      return parsed.map(normalizeTenant).filter((tenant) => tenant.phoneNumberId)
   } catch (error) {
      console.error('❌ Failed to load tenants.json:', error.message)
      return []
   }
}

const tenantList = parseTenantsFromFile()
const legacyTenant = normalizeTenant({
   tenantKey: 'default',
   phoneNumberId: env.phoneNumberId,
   whatsappAccessToken: env.akseToken,
   aiRagBaseUrl: env.aiRagBaseUrl,
   aiUsername: env.aiUsername,
   aiPassword: env.aiPassword,
   aiGrantType: env.aiGrantType,
   aiScope: env.aiScope,
   aiClientId: env.aiClientId,
   aiClientSecret: env.aiClientSecret
})

const getTenantByPhoneNumberId = (phoneNumberId) => {
   if (!phoneNumberId) {
      return null
   }

   const matchedTenant = tenantList.find((tenant) => tenant.phoneNumberId === phoneNumberId)
   if (matchedTenant) {
      return matchedTenant
   }

   if (legacyTenant.phoneNumberId === phoneNumberId) {
      return legacyTenant
   }

   return null
}

const getActiveTenantList = () => {
   if (tenantList.length > 0) {
      return tenantList
   }

   return legacyTenant.phoneNumberId ? [legacyTenant] : []
}

export const resolveTenantConfig = (phoneNumberId) => {
   const tenant = getTenantByPhoneNumberId(phoneNumberId)

   if (!tenant) {
      return {
         success: false,
         error: `No tenant config found for phone_number_id: ${phoneNumberId}`
      }
   }

   if (!tenant.whatsappAccessToken) {
      return {
         success: false,
         error: `Missing WhatsApp access token for phone_number_id: ${phoneNumberId}`
      }
   }

   if (!tenant.aiUsername || !tenant.aiPassword) {
      return {
         success: false,
         error: `Missing AI credentials for phone_number_id: ${phoneNumberId}`
      }
   }

   return {
      success: true,
      data: tenant
   }
}

export const getAllTenantConfigs = () => getActiveTenantList()
