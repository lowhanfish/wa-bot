import express from 'express'
const router = express.Router()

import pekerjaan from './pekerjaan/pekerjaan.route.js';
router.use('/pekerjaan', pekerjaan);

import jenisKelamin from './jenis-kelamin/jenis-kelamin.route.js';
router.use('/jenis-kelamin', jenisKelamin);

import masterAgama from './agama/agama.route.js'
router.use('/agama', masterAgama)



export default router