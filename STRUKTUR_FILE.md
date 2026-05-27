simpeg-backend/
│
├── src/
│ │
│ ├── config/
│ │ ├── database.js
│ │ └── env.js
│ │
│ ├── middlewares/
│ │ ├── auth.middleware.js
│ │ ├── error.middleware.js
│ │ └── logger.middleware.js
│ │
│ ├── utils/
│ │ ├── response.js
│ │ └── pagination.js
│ │
│ ├── modules/
│ │ │
│ │ ├── auth/
│ │ │ ├── auth.route.js
│ │ │ ├── auth.controller.js
│ │ │ ├── auth.service.js
│ │ │ ├── auth.repository.js
│ │ │ ├── auth.validation.js
│ │ │ └── auth.model.js
│ │ │
│ │ ├── pegawai/
│ │ │ ├── pegawai.route.js
│ │ │ ├── pegawai.controller.js
│ │ │ ├── pegawai.service.js
│ │ │ ├── pegawai.repository.js
│ │ │ ├── pegawai.validation.js
│ │ │ └── pegawai.model.js
│ │ │
│ │ └── absensi/
│ │ ├── absensi.route.js
│ │ ├── absensi.controller.js
│ │ ├── absensi.service.js
│ │ ├── absensi.repository.js
│ │ ├── absensi.validation.js
│ │ └── absensi.model.js
│ │
│ ├── app.js
│ └── server.js
│
├── .env
├── package.json
└── README.md
