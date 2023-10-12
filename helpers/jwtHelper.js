const createError = require('http-errors')
const JWT = require('jsonwebtoken')

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = { userId }
      JWT.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' }, (err, token) => {
        if (err) {
          console.error('Error creating access token:', err)
          reject(createError.InternalServerError('Internal Server Error'))
        }
        resolve(token)
      })
    })
  },

  verifyAccessToken: (req, res, next) => {
    const token = req.headers['x-access-token']
    if (!token) {
      return next(createError.BadRequest('Access token is missing'))
    }
    JWT.verify(token, JWT_ACCESS_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
        return next(createError.Unauthorized(message))
      }
      req.payload = payload
      next()
    })
  },

  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = { userId }
      JWT.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '1y' }, (err, token) => {
        if (err) {
          reject(createError.InternalServerError('Internal Server Error'))
        }
        resolve(token)
      })
    })
  },

  verifyRefreshToken: (token) => {
    return new Promise((resolve, reject) => {
      JWT.verify(token, JWT_REFRESH_SECRET, (err, payload) => {
        if (err) {
          console.error('Error verifying refresh token:', err)
          reject(createError.Unauthorized('Unauthorized'))
        }
        resolve(payload.userId)
      })
    })
  }
}
