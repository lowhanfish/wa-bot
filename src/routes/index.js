import express from 'express';
const router = express.Router()

import simpegRoutes from '../apps/simpeg/routes/index.js'
router.use('/simpeg',simpegRoutes);

export default router






