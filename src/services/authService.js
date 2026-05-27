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
      console.log(`📍 URL: ${env.aiRagBaseUrl}/api/v1/auth/login`)
      
      if (!env.aiUsername || !env.aiPassword) {
         return {
            success: false,
            error: 'Missing USERNAME/PASSWORD for AI-RAG login (env.aiUsername/env.aiPassword is empty)'
         }
      }

      const form = new URLSearchParams({
         grant_type: env.aiGrantType,
         username: env.aiUsername,
         password: env.aiPassword,
         scope: env.aiScope,
         client_id: env.aiClientId,
         client_secret: env.aiClientSecret || ''
      })

      const response = await fetch(`${env.aiRagBaseUrl}/api/v1/auth/login`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: form.toString()
      })

      const contentType = response.headers.get('content-type') || ''
      const raw = await response.text()

      let data = null
      if (contentType.includes('application/json')) {
         try {
            data = JSON.parse(raw)
         } catch (e) {
            data = { parseError: true, raw }
         }
      } else {
         data = { nonJson: true, raw }
      }

      if (!response.ok) {
         console.error('❌ Login failed:')
         console.error('Status:', response.status)
         console.error('Content-Type:', contentType)
         console.error('Response:', data && typeof data === 'object' ? data : raw)

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
      console.error('❌ LOGIN ERROR ❌')
      console.error('Error Type:', error.name)
      console.error('Error Message:', error.message)
      console.error('Error Stack:', error.stack)
      
      if (error.message.includes('ECONNREFUSED')) {
         console.error('⚠️ CONNECTION REFUSED - Pastikan server AI-RAG sudah running di:', env.aiRagBaseUrl)
      } else if (error.message.includes('ENOTFOUND')) {
         console.error('⚠️ HOST NOT FOUND - URL AI-RAG tidak valid:', env.aiRagBaseUrl)
      } else if (error.message.includes('ETIMEDOUT')) {
         console.error('⚠️ CONNECTION TIMEOUT - Server AI-RAG tidak merespons')
      }
      
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
      console.log(`📍 URL: ${env.aiRagBaseUrl}/api/v1/auth/refresh`)

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
         console.error('❌ Token refresh failed:')
         console.error('Status:', response.status)
         console.error('Response:', data)
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
      console.error('❌ REFRESH TOKEN ERROR ❌')
      console.error('Error Type:', error.name)
      console.error('Error Message:', error.message)
      console.error('Error Stack:', error.stack)
      
      if (error.message.includes('ECONNREFUSED')) {
         console.error('⚠️ CONNECTION REFUSED - Pastikan server AI-RAG sudah running')
      } else if (error.message.includes('ENOTFOUND')) {
         console.error('⚠️ HOST NOT FOUND - URL AI-RAG tidak valid:', env.aiRagBaseUrl)
      }
      
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
      console.log('\n🔍 === CHECKING TOKEN STATUS ===')
      
      // Jika belum pernah login, login dulu
      if (!tokenData.accessToken) {
         console.log('📌 No token found, performing initial login...')
         const loginResult = await loginToAI()
         if (!loginResult.success) {
            console.error('❌ Initial login failed')
            throw new Error('Login failed: ' + JSON.stringify(loginResult.error))
         }
         console.log('✅ Initial login successful')
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
               console.error('❌ Login failed after refresh failure')
               throw new Error('Login failed: ' + JSON.stringify(loginResult.error))
            }
            console.log('✅ Login successful after refresh failure')
         }
      } else {
         console.log('✅ Token is still valid')
      }

      return tokenData.accessToken
   } catch (error) {
      console.error('❌ ERROR GETTING VALID TOKEN ❌')
      console.error('Error Message:', error.message)
      console.error('Error Stack:', error.stack)
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
