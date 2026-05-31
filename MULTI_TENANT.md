# Multi-tenant WhatsApp setup

Untuk uji coba, daftar tenant dibaca dari file `tenants.json` di root project.

Contoh isi:

```json
[
  {
    "tenantKey": "cabang-a",
    "phoneNumberId": "123456789012345",
    "whatsappAccessToken": "EAAB...",
    "aiUsername": "user-a",
    "aiPassword": "pass-a",
    "aiRagBaseUrl": "http://10.10.20.40:8000"
  }
]
```

Aturan mapping:
- webhook membaca `value.metadata.phone_number_id`
- sistem memilih tenant yang cocok dari `tenants.json`
- token AI disimpan per `tenantKey`
- session user disimpan per `tenantKey + nomor pengirim`

Mode lama tetap jalan kalau `tenants.json` belum ada dan kamu masih pakai `PHONE_NUMBER_ID`, `AKSES_TOKEN`, `USERNAME`, dan `PASSWORD` tunggal.
