import axios from 'axios'
import express from 'express'
import * as Log from './logger'
import { getFirebaseConfig } from '../utils/firebaseConfig'
import { createTodoApp } from '../todo'

const router = express.Router()
const todoApp = createTodoApp(sendTextMessage)

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
  Log.messageRecieved(event)
  const { sender, message } = event
  const messageText = message.text
  const senderID = sender.id
  if (messageText) {
    const [ topic, ...parameters ] = messageText.split(' ')

    if (todoApp.isUserLastTodoDueDatePending(senderID)) {
      const datetime = firstNLPEntity(message.nlp, 'datetime')
      if (datetime && datetime.confidence > 0.8) {
        todoApp.updateDuedateToPendingUser({
          userId: senderID,
          dueDate: datetime
        })
      } else {
        sendTextMessage(senderID, 'I don\'t think that\'s the time you tried to tell me.')
      }

      return
    }

    switch (topic) {
      case 'add':
        todoApp.addTodo({ userId: senderID, title: parameters.join(' ') })
        break
      default:
        console.warn('Recieved unknow command.')
        sendTextMessage(senderID, 'I don\'t know how to react to that.')
    }
  }
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
        params: { access_token: getFirebaseConfig().fb.page_access_token }
      }
    ).then(res => {
      Log.messageSent(res.data)
      resolve(res.data)
    }).catch(error => {
      console.error('Unable to send message.')
      console.error(error)
      reject(error)
    })
  })
}
export default router
