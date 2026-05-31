import * as authService from './services/authService.js'
import { getAllTenantConfigs } from './services/tenantService.js'

/**
 * Initialize aplikasi
 * Login ke AI-RAG saat server pertama kali start
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const initializeApp = async () => {
   const maxAttempts = 5
   const delayMs = 2000
   const tenantConfigs = getAllTenantConfigs()

   if (tenantConfigs.length === 0) {
      console.warn('⚠️ No tenant config found. Server will still start, but webhook processing may fail.')
      return false
   }

   let allSuccess = true

   for (const tenantConfig of tenantConfigs) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
         try {
            console.log('\n🚀 === INITIALIZING APPLICATION ===\n')
            console.log(`🔁 AI-RAG login attempt ${attempt}/${maxAttempts}`)
            console.log(`🏷️ Tenant: ${tenantConfig.tenantKey}`)

            const loginResult = await authService.loginToAI(tenantConfig)

            if (loginResult.success) {
               console.log('\n✅ Application initialized successfully!')
               console.log(`✅ Connected to AI-RAG backend for tenant ${tenantConfig.tenantKey}`)
               break
            }

            allSuccess = false
            console.error('\n❌ Failed to initialize application')
            console.error('Error:', loginResult.error)

            if (attempt < maxAttempts) {
               console.warn(`⚠️ Retry in ${delayMs}ms...`)
               await sleep(delayMs)
               continue
            }

            console.warn(`⚠️ Login failed after max attempts for tenant ${tenantConfig.tenantKey}. Application will still start.`)
         } catch (error) {
            allSuccess = false
            console.error('\n❌ Initialization error:', error.message)

            if (attempt < maxAttempts) {
               console.warn(`⚠️ Retry in ${delayMs}ms...`)
               await sleep(delayMs)
               continue
            }

            console.warn(`⚠️ Login failed after max attempts for tenant ${tenantConfig.tenantKey}. Application will still start.`)
         }
      }
   }

   return allSuccess
}
