const wppconnect = require('@wppconnect-team/wppconnect');

const callToto = require('./services/callToto');




let client = null;
let currentQR = {
  text: null,
  image: null,
};
let isReady = false;
let isStarting = false;
let isMessageListenerAttached = false;
const SESSION_NAME = process.env.WA_SESSION_NAME || 'session1';
const AUTO_REPLY_ENABLED = String(process.env.WA_AUTO_REPLY || 'true').toLowerCase() === 'true';
const AUTO_REPLY_TEXT = process.env.WA_AUTO_REPLY_TEXT || 'Pesan kamu sudah kami terima.';

function normalizeNumber(number) {
  return String(number || '').replace(/\D/g, '');
}

function sanitizeJid(raw) {
  if (!raw) {
    return null;
  }
  return String(raw).trim();
}

function jidToUser(jid) {
  const value = sanitizeJid(jid);
  if (!value) {
    return null;
  }
  return value.split('@')[0] || null;
}

function resolveSender(message) {
  const from = sanitizeJid(message?.from);
  const author = sanitizeJid(message?.author);
  const senderId = sanitizeJid(message?.sender?.id);
  const senderUser = sanitizeJid(message?.sender?.user);
  const chatId = sanitizeJid(message?.chatId);
  const remoteId = sanitizeJid(message?.id?.remote);
  const to = sanitizeJid(message?.to);
  const fromMe = Boolean(message?.fromMe);

  const jidCandidates = [senderId, senderUser, author, from, chatId, remoteId, to];

  const preferredNumberJid = jidCandidates.find(
    (jid) => jid && (jid.endsWith('@c.us') || jid.endsWith('@s.whatsapp.net'))
  );

  // Jika pesan dari orang lain, hindari memakai `to` karena itu biasanya nomor bot kita sendiri.
  const raw = senderId || senderUser || author || from || chatId || remoteId || (fromMe ? to : null) || 'unknown';
  const resolved = jidToUser(preferredNumberJid) || jidToUser(raw) || 'unknown';

  return { raw, resolved };
}

function setupIncomingMessageLogger() {
  if (!client || isMessageListenerAttached) {
    return;
  }

  client.onMessage(async (message) => {
    const sender = resolveSender(message);
    const text = message.body || '[non-text message]';

    if (message.from === 'status@broadcast') {
      return;
    }

    console.log(`[INCOMING] from=${sender.resolved} raw=${sender.raw} message="${text}"`);

    if (!AUTO_REPLY_ENABLED || message.fromMe) {
      return;
    }

    const chatTarget = message.chatId || message.from || message.id?.remote || message.sender?.id;
    if (!chatTarget) {
      console.log('[AUTO_REPLY] skip: target chat tidak ditemukan');
      return;
    }

    try {

        const totoResponse = await callToto.callToto(text);
        const replyText = typeof totoResponse === 'string' ? totoResponse : JSON.stringify(totoResponse);

        await client.sendText(chatTarget, replyText);
        console.log(`[AUTO_REPLY] sent to=${chatTarget} text="${replyText}"`);
    } catch (err) {
      console.log(`[AUTO_REPLY] gagal kirim ke=${chatTarget} error="${err.message}"`);
    }

  });

  isMessageListenerAttached = true;
}

async function startSession(sessionName = SESSION_NAME) {
  if (client || isReady) {
    return { status: true, message: 'Session sudah aktif' };
  }

  if (isStarting) {
    return { status: false, message: 'Session sedang diproses, tunggu sebentar' };
  }

  isStarting = true;
  currentQR = { text: null, image: null };
  isReady = false;

  try {
    client = await wppconnect.create({
      session: sessionName,
      folderNameToken: 'tokens',
      mkdirFolderToken: true,
      autoClose: 0,
      headless: true,
      disableWelcome: true,
      catchQR: (qr, asciiQR, attempts, urlCode) => {
        const isImageDataUrl = typeof qr === 'string' && qr.startsWith('data:image/');
        currentQR = {
          text: typeof urlCode === 'string' && urlCode ? urlCode : isImageDataUrl ? null : qr,
          image: isImageDataUrl ? qr : null,
        };
        console.log('QR generated. Scan dari endpoint /qr.');
        if (asciiQR) {
          console.log(asciiQR);
        }
      },
      statusFind: (statusSession) => {
        console.log('Status:', statusSession);

        // Tandai ready untuk status login yang umum muncul saat restore session.
        if (['inChat', 'isLogged', 'qrReadSuccess', 'chatsAvailable'].includes(statusSession)) {
          isReady = true;
          currentQR = { text: null, image: null };
        }
      },
    });

    setupIncomingMessageLogger();

    return { status: true, message: 'Session started' };
  } catch (err) {
    client = null;
    isReady = false;
    currentQR = { text: null, image: null };
    isMessageListenerAttached = false;
    throw new Error(`Gagal start session: ${err.message}`);
  } finally {
    isStarting = false;
  }
}

function getQR() {
  return currentQR;
}

function getStatus() {
  return {
    ready: isReady,
    hasQR: Boolean(currentQR.text || currentQR.image),
    isStarting,
  };
}

async function sendMessage(number, message) {
  if (!client || !isReady) {
    throw new Error('WhatsApp belum ready atau QR belum discan');
  }

  const cleanNumber = normalizeNumber(number);
  if (!cleanNumber) {
    throw new Error('Nomor tujuan tidak valid');
  }

  if (!message || !String(message).trim()) {
    throw new Error('Pesan tidak boleh kosong');
  }

  await client.sendText(`${cleanNumber}@c.us`, String(message));
  return { status: true, message: 'Pesan terkirim' };
}

async function logoutSession() {
  if (!client) {
    return { status: false, message: 'Tidak ada session aktif' };
  }

  try {
    await client.logout();
  } finally {
    client = null;
    currentQR = { text: null, image: null };
    isReady = false;
    isStarting = false;
    isMessageListenerAttached = false;
  }

  return { status: true, message: 'Session dihapus' };
}

module.exports = {
  startSession,
  getQR,
  getStatus,
  sendMessage,
  logoutSession,
};
