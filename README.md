# wa-bot

Microservice sederhana untuk mengirim pesan WhatsApp menggunakan `@wppconnect-team/wppconnect` dan `Express`.

## Fitur

- Start session WhatsApp (`/start`)
- Auto-restore session saat server startup (tanpa scan ulang jika token masih valid)
- Ambil QR code dalam format Base64 (`/qr`)
- Ambil QR code sebagai gambar PNG langsung (`/qr/image`)
- Cek status koneksi (`/status`)
- Kirim pesan (`/send`)
- Logout session (`/logout`)
- Terima pesan masuk dan cetak otomatis ke terminal server
- Auto-reply pesan masuk (opsional, default aktif)

## Persiapan

1. Pastikan Node.js versi 18+ sudah terpasang.
2. Install dependency:

```bash
npm install
```

3. Jalankan server:

```bash
npm run start
```

Server akan berjalan di:

- `http://localhost:3000`
- atau port dari environment variable `PORT`

## Endpoint API

### 1. Start Session

`GET /start`

Memulai session WhatsApp dan menyiapkan QR.

Contoh response:

```json
{
  "status": true,
  "message": "Session started"
}
```

### 2. Ambil QR

`GET /qr`

Mengembalikan QR dalam Data URL Base64.

Contoh response sukses:

```json
{
  "status": true,
  "qr": "data:image/png;base64,iVBORw0KGgo..."
}
```

### 3. Ambil QR Sebagai Gambar

`GET /qr/image`

Mengembalikan QR sebagai file PNG langsung, cocok dibuka di browser atau Postman Preview agar mudah discan.

### 4. Cek Status

`GET /status`

Contoh response:

```json
{
  "ready": false,
  "hasQR": true,
  "isStarting": false
}
```

### 5. Kirim Pesan

`POST /send`

Body JSON:

```json
{
  "number": "62812xxxxxxx",
  "message": "Halo dari bot"
}
```

Contoh response:

```json
{
  "status": true,
  "message": "Pesan terkirim"
}
```

### 6. Logout Session

`GET /logout`

Menghapus session aktif.

## Menerima Pesan (Incoming)

Saat ini penerimaan pesan berjalan lewat listener internal di file:

- `whatsapp.js` pada fungsi `setupIncomingMessageLogger()`

Pesan yang masuk akan otomatis dicetak ke terminal server (stdout), contoh:

```text
[INCOMING] from=62812xxxxxxx@c.us message="Halo bot"
```

Catatan:
- Fitur receive belum diekspos sebagai endpoint webhook/API terpisah.
- Jadi untuk melihat pesan diterima, pantau log terminal tempat server berjalan.

## Auto Reply

Saat ini auto-reply aktif secara default. Ketika ada pesan masuk dari user lain, bot akan membalas otomatis.

Konfigurasi via environment variable:
- `WA_AUTO_REPLY=true|false` (default: `true`)
- `WA_AUTO_REPLY_TEXT="teks balasan"` (default: `Pesan kamu sudah kami terima.`)

Contoh menjalankan server dengan auto-reply custom:

```bash
WA_AUTO_REPLY=true WA_AUTO_REPLY_TEXT="Halo, pesanmu sudah masuk ya." npm run start
```

## Catatan

- Folder `tokens/` menyimpan data session browser/WhatsApp.
- Nomor tujuan otomatis dibersihkan ke format angka sebelum dikirim.
- Panggil `/start`, scan QR, lalu cek `/status` sampai `ready: true` sebelum mengirim pesan.
- Setelah scan pertama, restart server normalnya tidak perlu scan ulang (selama `tokens/` tidak dihapus dan tidak memanggil `/logout`).
- Pesan masuk otomatis tercetak di terminal lewat listener `setupIncomingMessageLogger()`.
