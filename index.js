const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const https = require('https')
const fs = require('fs')
const passport = require('passport')
const session = require('express-session')

require('dotenv').config()
require('./helpers/firebaseConfig')

const AuthRoute = require('./routes/jwtAuthRouter')
const AdminRoute = require('./routes/adminRouter')
const WhmcsRoute = require('./routes/whmcsRouter')
const OAuth2Route = require('./routes/oauth2Router')

const app = express()

const PORT = process.env.PORT
const HOST = process.env.HOST
const SSL = process.env.SSL
const SESSION_SECRET = process.env.SESSION_SECRET

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // False if  http
  })
)

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('public'))
app.use(passport.initialize())
app.use(passport.session())

app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', async (req, res, next) => {
  res.render('index', {
    name: 'Salman'
  })
})

app.use('/auth', AuthRoute)
app.use('/admin', AdminRoute)
app.use('/whmcs', WhmcsRoute)
app.use('/oauth2', OAuth2Route)

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

if (SSL === 'https') {
  // SSL
  const sslServer = https.createServer(
    {
      key: fs.readFileSync(__dirname + process.env.SSL_KEY),
      cert: fs.readFileSync(__dirname + process.env.SSL_CERT)
    },
    app
  )

  sslServer.listen(PORT, () => {
    console.log(`Server running on ${SSL}://${HOST}:${PORT}`)
  })
} else {
  // NO SSL
  app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`)
  })
}

module.exports = app
