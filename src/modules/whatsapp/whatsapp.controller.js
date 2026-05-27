import { testService } from './whatsapp.service.js'

export const testPost = async (req, res) => {

   const result = await testService(req.body)

   res.json({
      success: true,
      data: result
   })
}