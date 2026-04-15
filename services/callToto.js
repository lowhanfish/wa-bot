const URL_TOTO_CHAT = process.env.URL_TOTO_CHAT || 'http://127.0.0.1:8000/api/v1/chat/send';

function extractReply(data) {
  if (typeof data === 'string') {
    return data;
  }

  return (
    data?.response ||
    data?.message ||
    data?.data?.response ||
    data?.data?.message ||
    JSON.stringify(data)
  );
}

async function callToto(message) {
  const token = process.env.TOKEN || process.env.TOTO_TOKEN;

  if (!token) {
    throw new Error('TOKEN/TOTO_TOKEN belum di-set di environment');
  }

  const payload = {
    // session_id: null,
    session_id: "e22cdad5-e20e-4500-9407-74dfee269109",
    role: 'user',
    model: process.env.TOTO_MODEL || 'qwen2.5:7b',
    content: String(message || ''),
    stream: false,
  };

  const res = await fetch(URL_TOTO_CHAT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    throw new Error(`HTTP error ${res.status}${bodyText ? `: ${bodyText}` : ''}`);
  }

  const data = await res.json();
  return extractReply(data.content);
}

module.exports = {
  callToto,
};
