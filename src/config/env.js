import dotenv from 'dotenv'

dotenv.config()

export default {
   port: process.env.PORT,
   appName: process.env.APP_NAME,
   appSecret: process.env.APP_SECRET,
   verifyToken: process.env.VERIFY_TOKEN,
   akseToken: process.env.AKSES_TOKEN,
   phoneNumberId: process.env.PHONE_NUMBER_ID,
   
   // AI-RAG Config
   // aiRagBaseUrl: 'http://121.52.72.109:8000',
   aiRagBaseUrl: 'http://10.10.20.40:8000',
   aiUsername: process.env.USERNAME,
   aiPassword: process.env.PASSWORD,

   // AI-RAG Login (matches Swagger/curl)
   aiGrantType: process.env.AI_GRANT_TYPE || 'password',
   aiScope: process.env.AI_SCOPE || '',
   aiClientId: process.env.AI_CLIENT_ID || 'string',
   aiClientSecret: process.env.AI_CLIENT_SECRET
}
