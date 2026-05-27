import express from 'express'
import whatsappRoute from './modules/whatsapp/whatsapp.route.js'

const app = express()

app.use(express.json())
app.use('/whatsapp', whatsappRoute)

app.get("/", (req, res)=>{
    res.send("Server Active")
})

export default app