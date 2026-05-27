import crypto from 'crypto'

import env from '../../config/env.js'

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

// Fungsi untuk mengirim pesan WhatsApp
export const sendMessage = async (phoneNumber, messageText) => {
   try {
      const url = `https://graph.facebook.com/v25.0/${env.phoneNumberId}/messages`
      
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
            'Authorization': `Bearer ${env.akseToken}`,
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
         console.error('❌ Gagal mengirim pesan:', result)
         return {
            success: false,
            error: result
         }
      }
   } catch (error) {
      console.error('❌ Error mengirim pesan:', error)
      return {
         success: false,
         error: error.message
      }
   }
}

export const processWebhook = async (body) => {

   if (
      body.object !==
      'whatsapp_business_account'
   ) {
      return
   }

   body.entry.forEach((entry) => {

      entry.changes.forEach((change) => {

         const value = change.value

         if (
            value.messages &&
            value.messages[0]
         ) {

            const message = value.messages[0]

            const contact =
               value.contacts?.[0]

            const senderName =
               contact?.profile?.name

            const from = message.from

            console.log('\n=== 📨 PESAN MASUK ===')
            console.log('Nama:', senderName)
            console.log('Nomor:', from)

            if (message.type === 'text') {

               console.log(
                  'Pesan:',
                  message.text.body
               )

               // 🤖 AUTO-REPLY
               const autoReplyMessage = 'Hy ada yang bisa saya bantu?'
               sendMessage(from, autoReplyMessage)

            }

         }

      })

   })

}