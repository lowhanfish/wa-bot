const wppconnect = require('@wppconnect-team/wppconnect');

wppconnect.create({
    session: 'session1',
    catchQR: (qr, asciiQR) => {
        console.log('Scan QR berikut:')
        console.log(asciiQR)
    },
    statusFind: (statusSession) => {
        console.log('Status:', statusSession)
    },
    headless: true
})
.then((client) => start(client))
.catch((error) => console.log(error));

function start(client) {
    console.log("✅ WhatsApp ready")

    client.onMessage((message) => {
        console.log("Pesan masuk:", message.body)

        client.sendText(message.from, 'Halo! ini dari bot 🚀')
    });
}