import express from 'express';

const router = express.Router()

import masterRouter from './master/master.routes.js'
router.use('/master', masterRouter)



export default router