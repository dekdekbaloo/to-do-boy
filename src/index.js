import { createMessengerApp } from './messenger'

if (process.env.NODE_ENV === 'development') require('dotenv').config()
const messengerApp = createMessengerApp(({ senderId, text, reply }) => {
  console.log('recieved message from: %s text: %s', senderId, text)
})

messengerApp.start(process.env.PORT || 3000)
