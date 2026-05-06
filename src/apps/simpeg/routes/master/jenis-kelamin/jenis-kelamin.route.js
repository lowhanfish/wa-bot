import express from 'express'
const router = express.Router()



router.get("/", (req, res)=>{
    res.status(200).send({
        status: 'success',
        message: 'Data Master Jenis Kelamin (SIMPEG)',
        data: [{ id: 1, nama: 'Laki-laki' }, { id: 2, nama: 'Perempuan' }]
    })
})


export default router