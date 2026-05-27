import * as authService from './services/authService.js'

/**
 * Initialize aplikasi
 * Login ke AI-RAG saat server pertama kali start
 */
export const initializeApp = async () => {
   try {
      console.log('\n🚀 === INITIALIZING APPLICATION ===\n')

      // Login ke AI-RAG
      const loginResult = await authService.loginToAI()

      if (loginResult.success) {
         console.log('\n✅ Application initialized successfully!')
         console.log('✅ Connected to AI-RAG backend')
         return true
      } else {
         console.error('\n❌ Failed to initialize application')
         console.error('Error:', loginResult.error)
         console.warn('⚠️ Application will attempt to login on first request')
         return false
      }
   } catch (error) {
      console.error('\n❌ Initialization error:', error.message)
      console.warn('⚠️ Application will attempt to login on first request')
      return false
   }
}
