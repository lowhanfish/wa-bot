# STRUKTUR FILE

project-root/
│
├── src/
│ ├── app.js
│ # 🔹 Setup express (middleware global, parsing, route utama)
│
│ ├── server.js
│ # 🔹 Entry point (listen port, start server)
│
│ ├── config/
│ │ ├── env.js
│ │ # 🔹 Load environment (.env)
│ │
│ │ ├── database.js
│ │ # 🔹 Multi database connection (simpeg, absensi, dll)
│ │
│ │ └── logger.js
│ # 🔹 Logging (winston/pino, optional tapi bagus)
│
│ ├── apps/
│ # 🔥 LEVEL APLIKASI (domain besar)
│ │
│ │ ├── simpeg/
│ │ │ ├── routes/
│ │ │ │ └── index.js
│ │ │ # 🔹 Routing khusus simpeg (/simpeg/_)
│ │ │
│ │ │ ├── modules/
│ │ │ # 🔥 FITUR DALAM SIMPEG
│ │ │ │
│ │ │ │ ├── master/
│ │ │ │ # 🔥 DATA MASTER (grouping)
│ │ │ │ │
│ │ │ │ │ ├── gender/
│ │ │ │ │ │ ├── gender.controller.js
│ │ │ │ │ │ # 🔹 Handle request/response (req, res)
│ │ │ │ │ │
│ │ │ │ │ │ ├── gender.service.js
│ │ │ │ │ │ # 🔹 Business logic (aturan aplikasi)
│ │ │ │ │ │
│ │ │ │ │ │ ├── gender.repository.js
│ │ │ │ │ │ # 🔹 Query ke database MySQL
│ │ │ │ │ │
│ │ │ │ │ │ ├── gender.model.js
│ │ │ │ │ │ # 🔹 Struktur tabel / mapping data
│ │ │ │ │ │
│ │ │ │ │ │ ├── gender.route.js
│ │ │ │ │ │ # 🔹 Endpoint (/master/gender)
│ │ │ │ │ │
│ │ │ │ │ │ └── gender.validation.js
│ │ │ │ │ │ # 🔹 Validasi input (Joi/Zod)
│ │ │ │ │
│ │ │ │ │ └── pekerjaan/
│ │ │ │ │ ├── pekerjaan.controller.js
│ │ │ │ │ ├── pekerjaan.service.js
│ │ │ │ │ ├── pekerjaan.repository.js
│ │ │ │ │ ├── pekerjaan.model.js
│ │ │ │ │ ├── pekerjaan.route.js
│ │ │ │ │ └── pekerjaan.validation.js
│ │ │ │
│ │ │ │ └── pegawai/
│ │ │ │ ├── pegawai.controller.js
│ │ │ │ ├── pegawai.service.js
│ │ │ │ ├── pegawai.repository.js
│ │ │ │ ├── pegawai.model.js
│ │ │ │ ├── pegawai.route.js
│ │ │ │ └── pegawai.validation.js
│ │ │
│ │ └── README.md
│ │ # 🔹 Dokumentasi internal simpeg (opsional tapi bagus)
│ │
│ │
│ │ ├── absensi/
│ │ │ ├── routes/
│ │ │ │ └── index.js
│ │ │ │ # 🔹 Routing absensi (/absensi/_)
│ │ │ │
│ │ │ └── modules/
│ │ │ └── absensi/
│ │ │ ├── absensi.controller.js
│ │ │ ├── absensi.service.js
│ │ │ ├── absensi.repository.js
│ │ │ ├── absensi.model.js
│ │ │ └── absensi.route.js
│ │
│ ├── middlewares/
│ │ ├── auth.middleware.js
│ │ # 🔹 JWT / authentication global
│ │ │
│ │ ├── error.middleware.js
│ │ # 🔹 centralized error handler
│ │ │
│ │ └── rateLimit.middleware.js
│ │ # 🔹 limit request (security)
│
│ ├── common/
│ │ ├── utils/
│ │ │ ├── hash.js
│ │ │ # 🔹 hash password (bcrypt)
│ │ │ │
│ │ │ ├── formatter.js
│ │ │ # 🔹 format date / response
│ │ │ │
│ │ │ └── response.js
│ │ │ # 🔹 standard API response
│ │ │
│ │ ├── constants/
│ │ # 🔹 constant global (status code, dll)
│ │ │
│ │ └── helpers/
│ │ # 🔹 helper kecil reusable
│
│ ├── infrastructure/
│ │ └── database/
│ │ └── index.js
│ # 🔹 wrapper koneksi DB (pool, reconnect, dll)
│
│ └── routes/
│ └── index.js
│ # 🔹 global router (/simpeg, /absensi)
│
├── tests/
│ # 🔹 unit / integration testing
│
├── .env
│ # 🔹 environment config
│
├── package.json
│
└── README.md

# 🔹 dokumentasi project
