import express from 'express'
import morgan from 'morgan'

const app = express()
app.use(morgan('tiny'))
app.get('/hello', (req, res) => {
  res.send('hello!')
})

export default app
