const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
const cookieParser = require('cookie-parser')
const cors = require('cors')
// const https = require('https')

require('dotenv').config()
require('./helpers/firebase_config')

const AuthRoute = require('./Routes/authRouter')
const AdminRoute = require('./Routes/adminRouter')
const WhmcsRoute = require('./Routes/whmcsRouter')

const app = express()
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('public'))

app.set('views', './views')
app.set('view engine', 'ejs')

const PORT = process.env.PORT
const HOST = process.env.HOST
// const SSL = process.env.SSL

app.get('/', async (req, res, next) => {
  res.render('index', {
    name: 'Salman'
  })
})

app.use('/auth', AuthRoute)
app.use('/admin', AdminRoute)
app.use('/whmcs', WhmcsRoute)

app.use(async (req, res, next) => {
  next(createError.NotFound())
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send({
    error: {
      status: err.status || 500,
      message: err.message
    }
  })
})

// SSL
/*
const sslServer = https.createServer(
  {
  key: fs.readFileSync(__dirname + process.env.SSL_KEY),
  cert: fs.readFileSync(__dirname + process.env.SSL_CERT),
  },
  app
)

sslServer.listen(PORT, () => {
  console.log(`Server running on ${SSL}://${HOST}:${PORT}`);
});
*/

// NO SSL
app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`)
})

module.exports = app
