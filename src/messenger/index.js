import axios from 'axios'
import express from 'express'
import * as Log from './logger'
import { getFirebaseConfig } from '../utils/firebaseConfig'
import uniqid from 'uniqid'
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
function firstEntity (nlp, name) {
  return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0]
}
const todoDueDatePendingUsers = { }
function receivedMessage (event) {
  Log.messageRecieved(event)
  const { sender, message } = event
  const messageText = message.text
  const senderID = sender.id
  const datetime = firstEntity(message.nlp, 'datetime')
  if (todoDueDatePendingUsers[senderID]) {
    if (datetime && datetime.confidence > 0.8) {
      console.log('Received potential due date:', datetime.value)
      setTodoDuedate()
    }
    console.log('Clearing due date pending queue')
    delete todoDueDatePendingUsers[senderID]
  }
  if (messageText) {
    const [ topic, ...parameters ] = messageText.split(' ')
    switch (topic) {
      case 'add':
        const id = uniqid()
        addTodo({
          id,
          content: parameters.join(' ')
        })
        todoDueDatePendingUsers[senderID] = id
        sendTextMessage(senderID, 'When do you want to have this finished?')
        break
      default:
        sendTextMessage(senderID, 'I don\'t know how to react to that.')
    }
  }
}

function addTodo ({ id, content }) {
  console.log('adding todo id: %s with content: %s',
    id, content)
}
function setTodoDuedate ({ id, duedate }) {
  console.log('setting todo id: %s with duedate: %s',
    id, duedate)
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
    Log.messageSent(res.data)
  }).catch(error => {
    console.error('Unable to send message.')
    console.error(error)
  })
}
export default router
