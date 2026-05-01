const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const APP_SECRET = process.env.APP_SECRET; // Found in App Dashboard > Settings > Basic
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // Defined by you

// Capture raw body for signature verification
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// 1. Webhook Verification (GET)
app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.sendStatus(403);
    }
});

// 2. Webhook Events (POST)
app.post('/webhook', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];

    if (!signature) return res.sendStatus(401);

    const hmac = crypto.createHmac('sha256', APP_SECRET);
    const digest = Buffer.from('sha256=' + hmac.update(req.rawBody).digest('hex'), 'utf8');
    const checksum = Buffer.from(signature, 'utf8');

    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
        return res.sendStatus(401);
    }

    // --- PROSES PAYLOAD DIMULAI ---

    // 1. Ambil body data
    const body = req.body;

    // 2. Pastikan ini adalah event dari WhatsApp Business Account
    if (body.object === 'whatsapp_business_account') {

        // Iterasi melalui entry (biasanya hanya ada satu)
        body.entry.forEach((entry) => {

            // Iterasi melalui perubahan (changes)
            entry.changes.forEach((change) => {
                const value = change.value;

                // Pastikan ada pesan di dalam payload ini
                if (value.messages && value.messages[0]) {
                    const message = value.messages[0];
                    const contact = value.contacts ? value.contacts[0] : null;

                    // Mengambil data penting
                    const from = message.from; // Nomor WhatsApp pengirim
                    const senderName = contact ? contact.profile.name : 'Unknown';
                    const messageType = message.type; // text, image, dll.

                    console.log(`\n--- Pesan Masuk Baru ---`);
                    console.log(`nama pengirim : ${senderName}`)
                    console.log(`nomor: ${from}`)

                    // Logika berdasarkan tipe pesan
                    if (messageType === 'text') {
                        const textBody = message.text.body;
                        console.log(`Isi Pesan: ${textBody}`);

                        // DI SINI: Kamu bisa panggil fungsi untuk membalas pesan
                        // contoh: sendReply(from, "Halo, pesan kamu sudah kami terima!");
                    } else {
                        console.log(`Tipe pesan (${messageType}) belum didukung.`);
                    }
                }
            });
        });

        // Selalu kirim status 200 OK agar Meta tidak mencoba mengirim ulang
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Jika bukan event WhatsApp, kirim 404
        res.sendStatus(404);
    }
});
app.listen(5555, () => console.log('Webhook server listening on port 3000'));




