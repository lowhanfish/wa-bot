import dotenv from 'dotenv'

dotenv.config()

export default {
   port: process.env.PORT,
   appName: process.env.APP_NAME,
   appSecret: process.env.APP_SECRET,
   verifyToken: process.env.VERIFY_TOKEN
}