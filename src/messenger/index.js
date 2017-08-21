import axios from 'axios'
import express from 'express'
import { getFirebaseConfig } from '../utils/firebaseConfig'

const router = express.Router()

router.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === getFirebaseConfig().fb.verify_token) {
    console.log('Validating webhook')
    res.status(200).send(req.query['hub.challenge'])
  } else {
    console.error('Failed validation. Make sure the validation tokens match.')
    res.sendStatus(403)
  }
})

router.post('/webhook', (req, res) => {
  const data = req.body

  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach((entry) => {
      // const pageID = entry.id
      // const timeOfEvent = entry.time

      // Iterate over each messaging event
      entry.messaging.forEach((event) => {
        if (event.message) {
          receivedMessage(event)
        } else {
          console.log('Webhook received unknown event: ', event)
        }
      })
    })

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200)
  }
})

function receivedMessage (event) {
  // Putting a stub for now, we'll expand it in the following steps
  const senderID = event.sender.id
  const recipientID = event.recipient.id
  const timeOfMessage = event.timestamp
  const message = event.message

  console.log('Received message for user %d and page %d at %d with message:',
    senderID, recipientID, timeOfMessage)
  console.log(JSON.stringify(message))

  // const messageId = message.mid

  const messageText = message.text
  const messageAttachments = message.attachments

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID)
        break

      default:
        sendTextMessage(senderID, messageText)
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, 'Message with attachment received')
  }
}

function sendGenericMessage (recipientId, messageText) {
  // To be expanded in later sections
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

  callSendAPI(messageData)
}

function callSendAPI (messageData) {
  axios.post('https://graph.facebook.com/v2.6/me/messages',
    messageData, {
      params: { access_token: getFirebaseConfig().fb.page_access_token }
    }
  ).then(res => {
    const recipientId = res.data.recipient_id
    const messageId = res.data.message_id
    console.log('Successfully sent generic message with id %s to recipient %s',
      messageId, recipientId)
  }).catch(error => {
    console.error('Unable to send message.')
    console.error(error)
  })
}
export default router
