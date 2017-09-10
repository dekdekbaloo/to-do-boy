import { createMessengerApp } from './messenger'

if (process.env.NODE_ENV === 'development') require('dotenv').config()

const messengerApp = createMessengerApp(({ senderId, text, reply }) => {

})

messengerApp.start(process.env.PORT || 3000)
