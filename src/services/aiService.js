import env from '../config/env.js'
import * as authService from './authService.js'
import * as sessionService from './sessionService.js'

/**
 * Kirim pertanyaan ke backend AI-RAG dan dapatkan jawaban
 * @param {String} phoneNumber - Nomor WhatsApp pengirim
 * @param {String} question - Pertanyaan dari user
 * @returns {Object} {success, content, sessionId, error}
 */
export const askAI = async (phoneNumber, question) => {
   try {
      console.log('\n🤖 === ASKING AI ===')
      console.log('Phone:', phoneNumber)
      console.log('Question:', question)

      // 1. Dapatkan access token (auto-refresh jika expired)
      const accessToken = await authService.getValidAccessToken()
      console.log('✅ Got valid access token')

      // 2. Dapatkan session_id untuk nomor ini
      const sessionId = sessionService.getSessionId(phoneNumber)
      console.log('Session ID:', sessionId || 'null (first question)')

      // 3. Kirim pertanyaan ke AI-RAG
      const payload = {
         session_id: sessionId, // null untuk pertanyaan pertama
         role: 'user',
         model: 'qwen2.5:7b',
         content: question,
         stream: false
      }

      console.log('📤 Sending request to AI-RAG...')
      console.log('URL:', `${env.aiRagBaseUrl}/api/v1/chat/ask`)

      const response = await fetch(`${env.aiRagBaseUrl}/api/v1/chat/ask`, {
         method: 'POST',
         headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
         console.error('❌ AI request failed:', data)
         return {
            success: false,
            error: data,
            content: null,
            sessionId: null
         }
      }

      console.log('✅ AI response received')
      console.log('Response model:', data.model)
      console.log('Response session_id:', data.session_id)

      // 4. Simpan session_id baru untuk pertanyaan berikutnya
      sessionService.saveSessionId(phoneNumber, data.session_id)

      // 5. Return jawaban
      return {
         success: true,
         content: data.content,
         sessionId: data.session_id,
         model: data.model,
         createdAt: data.created_at,
         error: null
      }
   } catch (error) {
      console.error('❌ Error asking AI:', error.message)
      console.error('Error stack:', error.stack)
      return {
         success: false,
         error: error.message,
         content: null,
         sessionId: null
      }
   }
}

/**
 * Reset session untuk user tertentu
 * (jika user ingin memulai percakapan baru)
 * @param {String} phoneNumber
 */
export const resetUserSession = (phoneNumber) => {
   sessionService.deleteSessionId(phoneNumber)
   console.log(`🔄 Session reset for ${phoneNumber}`)
}

/**
 * Get current auth status
 * @returns {Object}
 */
export const getAuthStatus = () => {
   const tokenData = authService.getTokenData()
   const sessions = sessionService.getAllSessions()
   
   return {
      tokenData: {
         hasAccessToken: !!tokenData.accessToken,
         tokenExpiredIn: tokenData.expiresAt ? new Date(tokenData.expiresAt) : null,
         isExpired: tokenData.isExpired
      },
      activeSessions: sessions,
      totalActiveSessions: Object.keys(sessions).length
   }
}
