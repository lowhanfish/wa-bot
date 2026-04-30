const fs = require('fs')

const createSession = (session) => {
    const session = 'test context'
    return new Promise((resolve, reject) => {
        fs.writeFile('example.txt', session, (err)=>{
            if (err) {
                reject({
                    status : 500,
                    message : err
                })
            }
            resolve ({
                status : 200,
                message : "sukses melakukan generate session"
            })


        })
        
    })

}


const seachSession = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('example.txt', 'utf-8', (err, data)=>{
            if(err){
                reject({
                    status : 500,
                    message : err
                })
            }

            resolve({
                status : 200,
                message : data
            })
        })
    })


}



module.export  = {
    createSession : createSession,
    seachSession : seachSession

}