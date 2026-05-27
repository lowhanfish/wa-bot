import bodyParser from 'body-parser'

export default bodyParser.json({
   verify: (req, res, buf) => {
      req.rawBody = buf
   }
})