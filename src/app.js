import express from 'express'
import morgan from 'morgan'
require('dotenv').config()
const app = express()
app.use(morgan('tiny'))
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
    console.log('Validating webhook')
    res.status(200).send(req.query['hub.challenge'])
  } else {
    console.error('Failed validation. Make sure the validation tokens match.')
    res.sendStatus(403)
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('listening on port:', port)
})
