const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2').Strategy

require('dotenv').config()

const PORT = process.env.PORT
const HOST = process.env.HOST
const SSL = process.env.SSL
const IDCH_CLIENT_ID = process.env.IDCH_CLIENT_ID
const IDCH_CLIENT_SECRET = process.env.IDCH_CLIENT_SECRET

passport.use(
  'idch',
  new OAuth2Strategy(
    {
      authorizationURL: 'https://my.idcloudhost.com/oauth/authorize.php',
      tokenURL: 'https://my.idcloudhost.com/oauth/token.php',
      clientID: IDCH_CLIENT_ID,
      clientSecret: IDCH_CLIENT_SECRET,
      callbackURL: `${SSL}://${HOST}:${PORT}/auth/idcloudhost/callback`
    },
    function (request, accessToken, refreshToken, profile, done) {
      // Handle the result as needed
      done(null, profile)
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

module.exports = passport
