/**
 * Session Management Service
 * Menyimpan session_id untuk setiap nomor WhatsApp per tenant
 * Agar konteks percakapan tetap nyambung
 */

const userSessions = new Map()

const buildSessionKey = (tenantKey, phoneNumber) => `${tenantKey || 'default'}:${phoneNumber}`

export const getSessionId = (tenantKey, phoneNumber) => {
   const sessionKey = buildSessionKey(tenantKey, phoneNumber)
   const sessionId = userSessions.get(sessionKey)

   if (sessionId) {
      console.log(`✅ Session found for ${sessionKey}: ${sessionId}`)
   } else {
      console.log(`📌 No session found for ${sessionKey}, will use null for first question`)
   }

   return sessionId || null
}

export const saveSessionId = (tenantKey, phoneNumber, sessionId) => {
   const sessionKey = buildSessionKey(tenantKey, phoneNumber)
   userSessions.set(sessionKey, sessionId)
   console.log(`💾 Session saved for ${sessionKey}: ${sessionId}`)
}

export const deleteSessionId = (tenantKey, phoneNumber) => {
   const sessionKey = buildSessionKey(tenantKey, phoneNumber)
   userSessions.delete(sessionKey)
   console.log(`🗑️ Session deleted for ${sessionKey}`)
}

export const getAllSessions = () => {
   const sessions = {}
   userSessions.forEach((sessionId, sessionKey) => {
      sessions[sessionKey] = sessionId
   })
   return sessions
}

export const clearAllSessions = () => {
   userSessions.clear()
   console.log('🗑️ All sessions cleared')
}
