import * as authService from './authService.js'
import * as sessionService from './sessionService.js'

const isInvalidSessionError = (response, data) => {
   const status = response.status
   const content = typeof data === 'string' ? data : JSON.stringify(data || {})
   const normalizedContent = content.toLowerCase()

   const statusLooksLikeSessionProblem = [400, 404, 409, 422].includes(status)
   const contentLooksLikeSessionProblem =
      normalizedContent.includes('session') &&
      (
         normalizedContent.includes('not found') ||
         normalizedContent.includes('invalid') ||
         normalizedContent.includes('expired') ||
         normalizedContent.includes('missing') ||
         normalizedContent.includes('does not exist') ||
         normalizedContent.includes('gone')
      )

   return statusLooksLikeSessionProblem && contentLooksLikeSessionProblem
}

const askAIOnce = async (tenantConfig, phoneNumber, question, sessionId) => {
   console.log('\n🔐 Getting valid access token...')
   const accessToken = await authService.getValidAccessToken(tenantConfig)
   console.log('✅ Got valid access token')

   const payload = {
      session_id: sessionId,
      role: 'user',
      model: 'qwen2.5:7b',
      content: question,
      stream: false
   }

   console.log('\n📤 Sending request to AI-RAG...')
   console.log('URL:', `${tenantConfig.aiRagBaseUrl}/api/v1/chat/ask`)
   console.log('Payload:', JSON.stringify(payload, null, 2))

   const response = await fetch(`${tenantConfig.aiRagBaseUrl}/api/v1/chat/ask`, {
      method: 'POST',
      headers: {
         'Authorization': `Bearer ${accessToken}`,
         'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
   })

   const data = await response.json()

   return { response, data }
}

/**
 * Kirim pertanyaan ke backend AI-RAG dan dapatkan jawaban
 * @param {Object} tenantConfig - Konfigurasi tenant
 * @param {String} phoneNumber - Nomor WhatsApp pengirim
 * @param {String} question - Pertanyaan dari user
 * @returns {Object} {success, content, sessionId, error}
 */
export const askAI = async (tenantConfig, phoneNumber, question) => {
   try {
      const tenantKey = tenantConfig?.tenantKey || 'default'

      console.log('\n🤖 === ASKING AI ===')
      console.log('Tenant:', tenantKey)
      console.log('Phone:', phoneNumber)
      console.log('Question:', question)

      const sessionId = sessionService.getSessionId(tenantKey, phoneNumber)
      console.log('📝 Session ID:', sessionId || 'null (first question)')
      const { response, data } = await askAIOnce(tenantConfig, phoneNumber, question, sessionId)

      if (!response.ok) {
         const invalidSession = sessionId && isInvalidSessionError(response, data)

         if (invalidSession) {
            console.warn('⚠️ Session AI-RAG tidak valid, menghapus session lokal dan retry sekali dengan session_id null')
            sessionService.deleteSessionId(tenantKey, phoneNumber)

            const retryResult = await askAIOnce(tenantConfig, phoneNumber, question, null)

            if (!retryResult.response.ok) {
               console.error('\n❌ AI REQUEST FAILED AFTER SESSION RESET ❌')
               console.error('Status Code:', retryResult.response.status)
               console.error('Response:', JSON.stringify(retryResult.data, null, 2))
               return {
                  success: false,
                  error: retryResult.data,
                  content: null,
                  sessionId: null
               }
            }

            console.log('\n✅ AI response received after session reset')
            console.log('Response model:', retryResult.data.model)
            console.log('Response session_id:', retryResult.data.session_id)
            console.log('Response content length:', retryResult.data.content.length, 'characters')

            sessionService.saveSessionId(tenantKey, phoneNumber, retryResult.data.session_id)

            return {
               success: true,
               content: retryResult.data.content,
               sessionId: retryResult.data.session_id,
               model: retryResult.data.model,
               createdAt: retryResult.data.created_at,
               error: null
            }
         }

         console.error('\n❌ AI REQUEST FAILED ❌')
         console.error('Status Code:', response.status)
         console.error('Response:', JSON.stringify(data, null, 2))
         return {
            success: false,
            error: data,
            content: null,
            sessionId: null
         }
      }

      console.log('\n✅ AI response received')
      console.log('Response model:', data.model)
      console.log('Response session_id:', data.session_id)
      console.log('Response content length:', data.content.length, 'characters')

      sessionService.saveSessionId(tenantKey, phoneNumber, data.session_id)

      return {
         success: true,
         content: data.content,
         sessionId: data.session_id,
         model: data.model,
         createdAt: data.created_at,
         error: null
      }
   } catch (error) {
      console.error('\n❌ ERROR ASKING AI ❌')
      console.error('Error Type:', error.name)
      console.error('Error Message:', error.message)
      console.error('Error Stack:', error.stack)

      if (error.message.includes('ECONNREFUSED')) {
         console.error('⚠️ CONNECTION REFUSED - Server AI-RAG tidak running')
         console.error('📍 Pastikan server AI-RAG berjalan di:', tenantConfig?.aiRagBaseUrl)
      } else if (error.message.includes('ENOTFOUND')) {
         console.error('⚠️ HOST NOT FOUND - URL tidak valid:', tenantConfig?.aiRagBaseUrl)
      } else if (error.message.includes('ETIMEDOUT')) {
         console.error('⚠️ CONNECTION TIMEOUT - Server tidak merespons')
      }

      return {
         success: false,
         error: error.message,
         content: null,
         sessionId: null
      }
   }
}

export const resetUserSession = (tenantKey, phoneNumber) => {
   sessionService.deleteSessionId(tenantKey, phoneNumber)
   console.log(`🔄 Session reset for ${tenantKey}:${phoneNumber}`)
}

export const getAuthStatus = () => {
   return {
      activeSessions: sessionService.getAllSessions(),
      totalActiveSessions: Object.keys(sessionService.getAllSessions()).length
   }
}
