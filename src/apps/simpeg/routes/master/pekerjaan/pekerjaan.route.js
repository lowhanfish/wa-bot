import express from 'express'

const route = express.Router()

route.get('/', (req, res)=>{
    res.status(200).send({
        status : 200,
        message : "Master Jenis Pekerjaan",
        data : "ini adalah master pekerjaan"
    })
})

export default route