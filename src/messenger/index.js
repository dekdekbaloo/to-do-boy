import axios from 'axios'
import express from 'express'

const router = express.Router()

router.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
    console.log('Validating webhook')
    res.status(200).send(req.query['hub.challenge'])
  } else {
    console.error('Failed validation. Make sure the validation tokens match.')
    res.sendStatus(403)
  }
})

router.post('/webhook', (req, res) => {
  const data = req.body
  if (data.object === 'page') {
    data.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message) {
          receivedMessage(event)
        } else {
          console.log('Webhook received unknown event: ', event)
        }
      })
    })
    res.sendStatus(200)
  }
})

function firstNLPEntity (nlp, name) {
  return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0]
}

function receivedMessage (event) {
  const { sender, message } = event
  const messageText = message.text
}

function sendTextMessage (recipientId, messageText) {
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  }
  return callSendAPI(messageData)
}

function callSendAPI (messageData) {
  return new Promise((resolve, reject) => {
    axios.post('https://graph.facebook.com/v2.6/me/messages',
      messageData, {
        params: { access_token: process.env.FB_PAGE_ACCESS_TOKEN }
      }
    ).then(res => {
      resolve(res.data)
    }).catch(error => {
      console.error('Unable to send message.')
      console.error(error)
      reject(error)
    })
  })
}
export default router
