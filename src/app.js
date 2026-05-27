import express from 'express'

import rawBodyMiddleware from './middlewares/rawBody.middleware.js'

import whatsappRoute from './modules/whatsapp/whatsapp.route.js'

const app = express()

app.use(rawBodyMiddleware)

app.use('/', whatsappRoute)

export default app