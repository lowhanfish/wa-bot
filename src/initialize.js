import * as authService from './services/authService.js'

/**
 * Initialize aplikasi
 * Login ke AI-RAG saat server pertama kali start
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const initializeApp = async () => {
   const maxAttempts = 5
   const delayMs = 2000

   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
         console.log('\n🚀 === INITIALIZING APPLICATION ===\n')
         console.log(`🔁 AI-RAG login attempt ${attempt}/${maxAttempts}`)

         const loginResult = await authService.loginToAI()

         if (loginResult.success) {
            console.log('\n✅ Application initialized successfully!')
            console.log('✅ Connected to AI-RAG backend')
            return true
         }

         console.error('\n❌ Failed to initialize application')
         console.error('Error:', loginResult.error)

         if (attempt < maxAttempts) {
            console.warn(`⚠️ Retry in ${delayMs}ms...`)
            await sleep(delayMs)
            continue
         }

         console.warn('⚠️ Login failed after max attempts. Application will still start.')
         return false
      } catch (error) {
         console.error('\n❌ Initialization error:', error.message)

         if (attempt < maxAttempts) {
            console.warn(`⚠️ Retry in ${delayMs}ms...`)
            await sleep(delayMs)
            continue
         }

         console.warn('⚠️ Login failed after max attempts. Application will still start.')
         return false
      }
   }

   return false
}
