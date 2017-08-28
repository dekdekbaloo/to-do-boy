import axios from 'axios'
import express from 'express'
import * as Log from './logger'
import { getFirebaseConfig } from '../utils/firebaseConfig'
import { createConversations } from '../conversation'
import { createTodoApp } from '../todo'
// const todoApp = createTodoApp(callSendAPI)
const conversations = createConversations({
  initialState: { state: '' },
  scanner: (oldState, { message, nlp }) => {
    if (nlp && nlp.datetime) {
      if (oldState === 'duedatePending') {
        return {
          state: '',
          action: 'updateTodo',
          options: {
            duedate: nlp.datetime
          }
        }
      }
    }
    const [ command, ...args ] = message.split(' ')
    switch (command) {
      case 'add':
        return {
          state: 'duedatePending',
          action: 'addTodo',
          title: args.join(' ')
        }
      default:
        return { state: 'unknown' }
    }
  }
})

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
  if (messageText) {
    conversations.notify({
      userId: sender.id,
      message: messageText,
      nlp: firstNLPEntity(messageText)
    })
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
