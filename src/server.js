import app from './app.js'
import env from './config/env.js'
import { initializeApp } from './initialize.js'

// Start server
const startServer = async () => {
   try {
      // Initialize aplikasi (login ke AI-RAG)
      await initializeApp()

      // Start listening
      app.listen(env.port, () => {
         console.log(`\n✅ Server running on port ${env.port}`)
         console.log(`📍 Webhook URL: http://localhost:${env.port}/webhook\n`)
      })
   } catch (error) {
      console.error('Failed to start server:', error)
      process.exit(1)
   }
}

startServer()