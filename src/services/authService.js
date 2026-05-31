import env from '../config/env.js'

const tokenStore = new Map()

const buildTokenKey = (tenantKey) => tenantKey || 'default'

const getTokenRecord = (tenantKey) => {
   const key = buildTokenKey(tenantKey)
   if (!tokenStore.has(key)) {
      tokenStore.set(key, {
         accessToken: null,
         refreshToken: null,
         tokenType: null,
         expiresAt: null,
         tenantKey: key
      })
   }

   return tokenStore.get(key)
}

const getLoginConfig = (config = {}) => ({
   tenantKey: config.tenantKey || 'default',
   aiRagBaseUrl: config.aiRagBaseUrl || env.aiRagBaseUrl,
   username: config.aiUsername || env.aiUsername,
   password: config.aiPassword || env.aiPassword,
   grantType: config.aiGrantType || env.aiGrantType,
   scope: config.aiScope || env.aiScope,
   clientId: config.aiClientId || env.aiClientId,
   clientSecret: config.aiClientSecret ?? env.aiClientSecret
})

const validateLoginConfig = (loginConfig) => {
   if (!loginConfig.username || !loginConfig.password) {
      return 'Missing USERNAME/PASSWORD for AI-RAG login'
   }

   return null
}

/**
 * Login ke backend AI-RAG
 * @param {Object} config - Tenant config
 * @returns {Object} Token data atau error
 */
export const loginToAI = async (config = {}) => {
   try {
      const loginConfig = getLoginConfig(config)
      const validationError = validateLoginConfig(loginConfig)

      console.log('🔐 Logging in to AI-RAG...')
      console.log(`📍 URL: ${loginConfig.aiRagBaseUrl}/api/v1/auth/login`)

      if (validationError) {
         return {
            success: false,
            error: `${validationError} (tenant: ${loginConfig.tenantKey})`
         }
      }

      const form = new URLSearchParams({
         grant_type: loginConfig.grantType,
         username: loginConfig.username,
         password: loginConfig.password,
         scope: loginConfig.scope,
         client_id: loginConfig.clientId,
         client_secret: loginConfig.clientSecret || ''
      })

      const response = await fetch(`${loginConfig.aiRagBaseUrl}/api/v1/auth/login`, {
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

      const tokenData = {
         accessToken: data.access_token,
         refreshToken: data.refresh_token,
         tokenType: data.token_type,
         expiresAt: Date.now() + (15 * 60 * 1000)
      }

      tokenStore.set(buildTokenKey(loginConfig.tenantKey), {
         ...tokenData,
         tenantKey: buildTokenKey(loginConfig.tenantKey)
      })

      console.log('✅ Login successful! Token stored.')
      console.log('Tenant:', loginConfig.tenantKey)
      console.log('Access Token:', tokenData.accessToken?.substring(0, 20) + '...')
      console.log('Refresh Token:', tokenData.refreshToken?.substring(0, 20) + '...')

      return {
         success: true,
         data: {
            ...tokenData,
            tenantKey: buildTokenKey(loginConfig.tenantKey)
         }
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
 * @param {Object} config - Tenant config
 * @returns {Object} New token data atau error
 */
export const refreshAccessToken = async (config = {}) => {
   try {
      const loginConfig = getLoginConfig(config)
      const tokenData = getTokenRecord(loginConfig.tenantKey)

      if (!tokenData.refreshToken) {
         console.error('❌ No refresh token available')
         return {
            success: false,
            error: 'No refresh token available'
         }
      }

      console.log('🔄 Refreshing access token...')
      console.log(`📍 URL: ${loginConfig.aiRagBaseUrl}/api/v1/auth/refresh`)

      const response = await fetch(
         `${loginConfig.aiRagBaseUrl}/api/v1/auth/refresh?refresh_token=${tokenData.refreshToken}`,
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

      const updatedTokenData = {
         ...tokenData,
         accessToken: data.access_token,
         tokenType: data.token_type,
         expiresAt: Date.now() + (15 * 60 * 1000)
      }

      tokenStore.set(buildTokenKey(loginConfig.tenantKey), updatedTokenData)

      console.log('✅ Token refreshed successfully!')
      console.log('Tenant:', loginConfig.tenantKey)
      console.log('New Access Token:', updatedTokenData.accessToken?.substring(0, 20) + '...')

      return {
         success: true,
         data: updatedTokenData
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
 * @param {Object} config - Tenant config
 * @returns {Boolean}
 */
export const isTokenExpired = (config = {}) => {
   const loginConfig = getLoginConfig(config)
   const tokenData = getTokenRecord(loginConfig.tenantKey)

   if (!tokenData.expiresAt) {
      return true
   }

   return Date.now() >= tokenData.expiresAt
}

/**
 * Dapatkan access token yang valid
 * Jika expired, auto refresh
 * @param {Object} config - Tenant config
 * @returns {String} Access token
 */
export const getValidAccessToken = async (config = {}) => {
   try {
      const loginConfig = getLoginConfig(config)
      const tokenData = getTokenRecord(loginConfig.tenantKey)

      console.log('\n🔍 === CHECKING TOKEN STATUS ===')
      console.log('Tenant:', loginConfig.tenantKey)

      if (!tokenData.accessToken) {
         console.log('📌 No token found, performing initial login...')
         const loginResult = await loginToAI(loginConfig)
         if (!loginResult.success) {
            console.error('❌ Initial login failed')
            throw new Error('Login failed: ' + JSON.stringify(loginResult.error))
         }
         console.log('✅ Initial login successful')
         return getTokenRecord(loginConfig.tenantKey).accessToken
      }

      if (isTokenExpired(loginConfig)) {
         console.log('📌 Token expired, refreshing...')
         const refreshResult = await refreshAccessToken(loginConfig)
         if (!refreshResult.success) {
            console.log('📌 Refresh failed, logging in again...')
            const loginResult = await loginToAI(loginConfig)
            if (!loginResult.success) {
               console.error('❌ Login failed after refresh failure')
               throw new Error('Login failed: ' + JSON.stringify(loginResult.error))
            }
            console.log('✅ Login successful after refresh failure')
         }
      } else {
         console.log('✅ Token is still valid')
      }

      return getTokenRecord(loginConfig.tenantKey).accessToken
   } catch (error) {
      console.error('❌ ERROR GETTING VALID TOKEN ❌')
      console.error('Error Message:', error.message)
      console.error('Error Stack:', error.stack)
      throw error
   }
}

/**
 * Dapatkan current token data
 * @param {String} tenantKey
 * @returns {Object}
 */
export const getTokenData = (tenantKey = 'default') => {
   const tokenData = getTokenRecord(tenantKey)

   return {
      ...tokenData,
      isExpired: isTokenExpired({ tenantKey })
   }
}

export const clearTokenData = (tenantKey = 'default') => {
   tokenStore.delete(buildTokenKey(tenantKey))
}
