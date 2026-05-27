export const testService = async (payload) => {

   console.log(payload)

   return {
      message: 'POST berhasil',
      request: payload
   }
}