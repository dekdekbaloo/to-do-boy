import express from 'express'
import messenger from './messenger'
import morgan from 'morgan'

const app = express()
app.use(morgan('tiny'))
app.use(messenger)

export default app
