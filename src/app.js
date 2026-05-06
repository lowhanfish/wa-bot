
import 'dotenv/config'
import express from 'express'

const app = express();
app.use(express.json());

import globalSimpeg from './routes/index.js'
app.use('/api',globalSimpeg)


const port = process.env.PORT
app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})




