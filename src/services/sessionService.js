/**
 * Session Management Service
 * Menyimpan session_id untuk setiap nomor WhatsApp
 * Agar konteks percakapan tetap nyambung
 */

// Storage: phoneNumber -> sessionId
const userSessions = new Map()

/**
 * Dapatkan session_id untuk nomor tertentu
 * Jika belum ada, return null (untuk pertanyaan pertama)
 * @param {String} phoneNumber - Nomor pengirim
 * @returns {String|null}
 */
export const getSessionId = (phoneNumber) => {
   const sessionId = userSessions.get(phoneNumber)
   if (sessionId) {
      console.log(`✅ Session found for ${phoneNumber}: ${sessionId}`)
   } else {
      console.log(`📌 No session found for ${phoneNumber}, will use null for first question`)
   }
   return sessionId || null
}

/**
 * Simpan session_id untuk nomor tertentu
 * Dipanggil setelah mendapat response dari AI
 * @param {String} phoneNumber - Nomor pengirim
 * @param {String} sessionId - Session ID dari API response
 */
export const saveSessionId = (phoneNumber, sessionId) => {
   userSessions.set(phoneNumber, sessionId)
   console.log(`💾 Session saved for ${phoneNumber}: ${sessionId}`)
}

/**
 * Hapus session (optional, jika user ingin reset)
 * @param {String} phoneNumber
 */
export const deleteSessionId = (phoneNumber) => {
   userSessions.delete(phoneNumber)
   console.log(`🗑️ Session deleted for ${phoneNumber}`)
}

/**
 * Dapatkan semua sessions yang ada
 * @returns {Object}
 */
export const getAllSessions = () => {
   const sessions = {}
   userSessions.forEach((sessionId, phoneNumber) => {
      sessions[phoneNumber] = sessionId
   })
   return sessions
}

/**
 * Clear semua sessions (untuk debug/testing)
 */
export const clearAllSessions = () => {
   userSessions.clear()
   console.log('🗑️ All sessions cleared')
}
