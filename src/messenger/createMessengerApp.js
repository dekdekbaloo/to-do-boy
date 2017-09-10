import axios from 'axios'
import bodyParser from 'body-parser'
import express from 'express'

const createMessengerApp = handleMessage /* ({ senderId: string, text: string, reply: fn }) */ => {
  const app = express()
  app.use(bodyParser.json())

  const callSendAPI = messageData =>
    axios.post('https://graph.facebook.com/v2.6/me/messages',
      messageData, {
        params: { access_token: process.env.FB_PAGE_ACCESS_TOKEN }
      }
    ).catch(error => {
      console.error('Unable to send message.\n', error)
    })

  const createMessageSender = recipientId => messageText => {
    callSendAPI({
      recipient: {
        id: recipientId
      },
      message: {
        text: messageText
      }
    })
  }

  const _handleMessage = event => {
    console.log('Recieved message event:\n', event)
    handleMessage({
      senderId: event.sender.id,
      text: event.message.text,
      reply: createMessageSender(event.sender.id)
    })
  }

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

  app.post('/webhook', (req, res) => {
    const data = req.body
    if (data.object === 'page') {
      data.entry.forEach((entry) => {
        entry.messaging.forEach((event) => {
          if (event.message) {
            _handleMessage(event)
          } else {
            console.log('Webhook received unknown event:\n', event)
          }
        })
      })
      res.sendStatus(200)
    }
  })

  return {
    start: port => app.listen(port, () => {
      console.log('Messenger app is listening on port:', port)
    })
  }
}

export { createMessengerApp }

// function firstNLPEntity (nlp, name) {
//   return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0]
// }
