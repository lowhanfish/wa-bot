require('dotenv').config();

const express = require('express');
const QRCode = require('qrcode');



const {
  startSession,
  getQR,
  getStatus,
  sendMessage,
  logoutSession,
} = require('./whatsapp');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'wa-bot',
    status: 'ok',
    endpoints: ['/start', '/qr', '/qr/image', '/status', '/send', '/logout'],
  });
});

app.get('/start', async (req, res) => {
  try {
    const result = await startSession();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/qr', async (req, res) => {
  try {
    const qr = getQR();

    if (!qr || (!qr.text && !qr.image)) {
      return res.json({
        status: false,
        message: 'QR belum tersedia atau session sudah login',
      });
    }

    const qrImage = qr.image || (await QRCode.toDataURL(qr.text));
    res.json({ status: true, qr: qrImage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/qr/image', async (req, res) => {
  try {
    const qr = getQR();

    if (!qr || (!qr.text && !qr.image)) {
      return res.status(404).json({
        status: false,
        message: 'QR belum tersedia atau session sudah login',
      });
    }

    const qrImage = qr.image || (await QRCode.toDataURL(qr.text));
    const base64Data = qrImage.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', imageBuffer.length);
    return res.send(imageBuffer);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/status', (req, res) => {
  res.json(getStatus());
});

app.post('/send', async (req, res) => {
  try {
    const { number, message } = req.body || {};

    if (!number || !message) {
      return res.status(400).json({
        status: false,
        message: 'number dan message wajib diisi',
      });
    }

    const result = await sendMessage(number, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/logout', async (req, res) => {
  try {
    const result = await logoutSession();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

  // Auto-restore session saat server nyala.
  startSession()
    .then((result) => {
      console.log('Auto start session:', result.message);
    })
    .catch((err) => {
      console.error('Auto start session error:', err.message);
    });
});
