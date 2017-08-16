import express from 'express'
import morgan from 'morgan'
const app = express()
app.use(morgan('tiny'))
app.get('/webhook', (req, res) => {
  res.sendStatus(200)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('listening on port:', port)
})
