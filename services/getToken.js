

const getToken = async () => {
    const payload = {
        "refresh_token" : process.env.REFRESH_TOKEN,
        "token_type": "bearer"
    }

    const res = await fetch(process.env.URL_TOTO_REFRESH+"?refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzgxNjcxMDYsInN1YiI6Ijg4ZmY0OTA2LTYxODEtNDkyOS04NzRmLWI2YTlkYmQ4ZDE4MSIsInR5cGUiOiJyZWZyZXNoIn0.i4WXyh4A6cIp2xBL25-T6TTwZdM2m824L3u6vXxzYwY", {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: '' // karena di curl pakai -d ''
    })


    if (!res.ok) {
        console.log(res)
       return "Error refresh token"
    } else {
        const data = await res.json();
        return data

    }


}



module.exports = {
    getToken : getToken
}