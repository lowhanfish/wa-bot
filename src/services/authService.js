import env from '../config/env.js'

// Global token storage
let tokenData = {
   accessToken: null,
   refreshToken: null,
   tokenType: null,
   expiresAt: null
}

/**
 * Login ke backend AI-RAG
 * @returns {Object} Token data atau error
 */
export const loginToAI = async () => {
   try {
      console.log('🔐 Logging in to AI-RAG...')
      
      const response = await fetch(`${env.aiRagBaseUrl}/api/v1/auth/login`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            username: env.aiUsername,
            password: env.aiPassword
         })
      })

      const data = await response.json()

      if (!response.ok) {
         console.error('❌ Login failed:', data)
         return {
            success: false,
            error: data
         }
      }

      // Simpan token dengan waktu expiry (15 menit = 900 detik)
      tokenData = {
         accessToken: data.access_token,
         refreshToken: data.refresh_token,
         tokenType: data.token_type,
         expiresAt: Date.now() + (15 * 60 * 1000) // 15 menit
      }

      console.log('✅ Login successful! Token stored.')
      console.log('Access Token:', tokenData.accessToken.substring(0, 20) + '...')
      console.log('Refresh Token:', tokenData.refreshToken.substring(0, 20) + '...')
      
      return {
         success: true,
         data: tokenData
      }
   } catch (error) {
      console.error('❌ Login error:', error.message)
      return {
         success: false,
         error: error.message
      }
   }
}

/**
 * Refresh access token menggunakan refresh token
 * @returns {Object} New token data atau error
 */
export const refreshAccessToken = async () => {
   try {
      if (!tokenData.refreshToken) {
         console.error('❌ No refresh token available')
         return {
            success: false,
            error: 'No refresh token available'
         }
      }

      console.log('🔄 Refreshing access token...')

      const response = await fetch(
         `${env.aiRagBaseUrl}/api/v1/auth/refresh?refresh_token=${tokenData.refreshToken}`,
         {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            }
         }
      )

      const data = await response.json()

      if (!response.ok) {
         console.error('❌ Token refresh failed:', data)
         return {
            success: false,
            error: data
         }
      }

      // Update token dengan waktu expiry baru
      tokenData.accessToken = data.access_token
      tokenData.tokenType = data.token_type
      tokenData.expiresAt = Date.now() + (15 * 60 * 1000) // 15 menit

      console.log('✅ Token refreshed successfully!')
      console.log('New Access Token:', tokenData.accessToken.substring(0, 20) + '...')

      return {
         success: true,
         data: tokenData
      }
   } catch (error) {
      console.error('❌ Refresh token error:', error.message)
      return {
         success: false,
         error: error.message
      }
   }
}

/**
 * Cek apakah token expired
 * @returns {Boolean}
 */
export const isTokenExpired = () => {
   if (!tokenData.expiresAt) {
      return true
   }
   return Date.now() >= tokenData.expiresAt
}

/**
 * Dapatkan access token yang valid
 * Jika expired, auto refresh
 * @returns {String} Access token
 */
export const getValidAccessToken = async () => {
   try {
      // Jika belum pernah login, login dulu
      if (!tokenData.accessToken) {
         console.log('📌 No token found, performing initial login...')
         const loginResult = await loginToAI()
         if (!loginResult.success) {
            throw new Error('Login failed: ' + loginResult.error)
         }
         return tokenData.accessToken
      }

      // Cek apakah token expired
      if (isTokenExpired()) {
         console.log('📌 Token expired, refreshing...')
         const refreshResult = await refreshAccessToken()
         if (!refreshResult.success) {
            // Jika refresh gagal, login ulang
            console.log('📌 Refresh failed, logging in again...')
            const loginResult = await loginToAI()
            if (!loginResult.success) {
               throw new Error('Login failed: ' + loginResult.error)
            }
         }
      }

      return tokenData.accessToken
   } catch (error) {
      console.error('❌ Error getting valid token:', error.message)
      throw error
   }
}

/**
 * Dapatkan current token data
 * @returns {Object}
 */
export const getTokenData = () => {
   return {
      ...tokenData,
      isExpired: isTokenExpired()
   }
}
