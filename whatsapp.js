const wppconnect = require('@wppconnect-team/wppconnect');

let client = null;

async function startSession(sessionName = 'session1') {
    if (client) {
        return { status: false, message: "Session already running" }
    }

    client = await wppconnect.create({
        session: sessionName,
        autoClose: 0,
        headless: true,
        catchQR: (qr, asciiQR) => {
            console.log('Scan QR berikut:\n', asciiQR)
        },
        statusFind: (statusSession) => {
            console.log('Status:', statusSession)
        }
    })

    console.log("✅ WhatsApp ready")

    client.onMessage((message) => {
        console.log("Pesan masuk:", message.body)
    })

    return { status: true, message: "Session started" }
}

async function sendMessage(number, message) {
    if (!client) {
        throw new Error("Session belum aktif")
    }

    const phone = number + "@c.us"
    await client.sendText(phone, message)

    return { status: true, message: "Pesan terkirim" }
}

async function logoutSession() {
    if (!client) {
        return { status: false, message: "Tidak ada session" }
    }

    await client.logout()
    client = null

    return { status: true, message: "Session dihapus" }
}

module.exports = {
    startSession,
    sendMessage,
    logoutSession
}