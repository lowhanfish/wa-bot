import * as service from './whatsapp.service.js'

export const verifyWebhook = (req, res) => {

   const result = service.verifyWebhook(req)

   if (result.success) {
      return res
         .status(200)
         .send(result.challenge)
   }

   res.sendStatus(403)
}

export const receiveWebhook = (req, res) => {

   const isValid =
      service.verifySignature(req)

   if (!isValid) {
      return res.sendStatus(401)
   }

   service.processWebhook(req.body)

   res.status(200).send('EVENT_RECEIVED')
}