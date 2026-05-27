import { Router } from 'express'

import { testPost } from './whatsapp.controller.js'

const router = Router()

router.get('/test', testPost)
router.post('/test', testPost)

export default router