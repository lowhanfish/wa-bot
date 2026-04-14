const express = require('express')
const bodyParser = require('body-parser')

const {
    startSession,
    sendMessage,
    logoutSession
} = require('./whatsapp')

const app = express()
app.use(bodyParser.json())

// ✅ 1. Start session (scan QR)
app.get('/start', async (req, res) => {
    try {
        const result = await startSession()
        res.json(result)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ✅ 2. Send message
app.post('/send', async (req, res) => {
    try {
        const { number, message } = req.body

        const result = await sendMessage(number, message)
        res.json(result)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ✅ 3. Logout (hapus session)
app.get('/logout', async (req, res) => {
    try {
        const result = await logoutSession()
        res.json(result)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(3000, () => {
    console.log("🚀 Server running di http://localhost:3000")
})