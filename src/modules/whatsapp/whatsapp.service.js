import crypto from 'crypto'

import env from '../../config/env.js'
import * as aiService from '../../services/aiService.js'
import { getAllTenantConfigs, resolveTenantConfig } from '../../services/tenantService.js'

export const verifyWebhook = (req) => {

   const mode = req.query['hub.mode']

   const token = req.query['hub.verify_token']

   const challenge = req.query['hub.challenge']

   if (
      mode === 'subscribe' &&
      token === env.verifyToken
   ) {
      return {
         success: true,
         challenge
      }
   }

   return {
      success: false
   }
}

export const verifySignature = (req) => {

   const signature =
      req.headers['x-hub-signature-256']

   if (!signature) {
      return false
   }

   const hmac = crypto.createHmac(
      'sha256',
      env.appSecret
   )

   const digest = Buffer.from(
      'sha256=' +
      hmac.update(req.rawBody).digest('hex'),
      'utf8'
   )

   const checksum = Buffer.from(
      signature,
      'utf8'
   )

   if (
      checksum.length !== digest.length
   ) {
      return false
   }

   return crypto.timingSafeEqual(
      digest,
      checksum
   )
}

export const sendMessage = async (tenantConfig, phoneNumber, messageText) => {
   try {
      const url = `https://graph.facebook.com/v25.0/${tenantConfig.phoneNumberId}/messages`

      const payload = {
         messaging_product: 'whatsapp',
         to: phoneNumber,
         type: 'text',
         text: {
            body: messageText
         }
      }

      const response = await fetch(url, {
         method: 'POST',
         headers: {
            'Authorization': `Bearer ${tenantConfig.whatsappAccessToken}`,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok) {
         console.log('✅ Pesan berhasil dikirim ke:', phoneNumber)
         return {
            success: true,
            data: result
         }
      } else {
         console.error('❌ Gagal mengirim pesan ke:', phoneNumber)
         console.error('Status Code:', response.status)
         console.error('Error Detail:', JSON.stringify(result, null, 2))
         return {
            success: false,
            error: result
         }
      }
   } catch (error) {
      console.error('❌ ERROR MENGIRIM PESAN ❌')
      console.error('Phone Number:', phoneNumber)
      console.error('Error Message:', error.message)
      console.error('Error Stack:', error.stack)
      return {
         success: false,
         error: error.message
      }
   }
}

const getPhoneNumberIdFromValue = (value) => {
   return value?.metadata?.phone_number_id || null
}

export const processWebhook = async (body) => {

   if (
      body.object !==
      'whatsapp_business_account'
   ) {
      return
   }

   try {
      const entries = body.entry || []

      for (const entry of entries) {
         const changes = entry.changes || []

         for (const change of changes) {
            const value = change.value
            const phoneNumberId = getPhoneNumberIdFromValue(value)

            if (!phoneNumberId) {
               console.warn('⚠️ phone_number_id tidak ditemukan di webhook payload')
               continue
            }

            console.log('🔎 Incoming phone_number_id:', phoneNumberId)

            const tenantResult = resolveTenantConfig(phoneNumberId)
            if (!tenantResult.success) {
               console.error('❌ Tenant config not found:', tenantResult.error)
               console.error('📋 Available tenant ids:', JSON.stringify(getAllTenantConfigs().map((tenant) => ({
                  tenantKey: tenant.tenantKey,
                  phoneNumberId: tenant.phoneNumberId
               }))))
               continue
            }

            const tenantConfig = tenantResult.data

            if (
               value.messages &&
               value.messages[0]
            ) {
               const message = value.messages[0]
               const contact = value.contacts?.[0]
               const senderName = contact?.profile?.name

               console.log('================ VALUE ================')
               console.log(value)
               console.log('================ END VALUE ================')

               const from = message.from

               console.log('\n=== 📨 PESAN MASUK ===')
               console.log('Tenant:', tenantConfig.tenantKey)
               console.log('Nama:', senderName)
               console.log('Nomor:', from)
               console.log('phone_number_id:', phoneNumberId)

               if (message.type === 'text') {
                  const userMessage = message.text.body
                  console.log('Pesan:', userMessage)

                  console.log('\n⏳ Processing message with AI...')
                  const aiResponse = await aiService.askAI(tenantConfig, from, userMessage)

                  if (aiResponse.success) {
                     console.log('\n✅ AI Response received:')
                     console.log(aiResponse.content)

                     console.log('\n📤 Sending AI response back to WhatsApp...')
                     const sendResult = await sendMessage(tenantConfig, from, aiResponse.content)

                     if (sendResult.success) {
                        console.log('\n✅ AI Response sent successfully to user!')
                     } else {
                        console.error('\n❌ Failed to send AI response to user')
                     }
                  } else {
                     console.error('\n❌ AI Request failed:', aiResponse.error)

                     const errorMessage = '❌ Maaf, terjadi kesalahan saat memproses pertanyaan. Silakan coba lagi.'
                     await sendMessage(tenantConfig, from, errorMessage)
                  }
               }
            }
         }
      }
   } catch (error) {
      console.error('\n❌ ERROR PROCESS WEBHOOK ❌')
      console.error('Error Message:', error.message)
      console.error('Error Stack:', error.stack)
      console.error('Full Error:', error)
   }

}
