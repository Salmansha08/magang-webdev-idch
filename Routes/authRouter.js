const express = require('express')
const router = express.Router()
const createError = require('http-errors')
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require('../helpers/jwt_helper')
const User = require('../models/userModel')
const db = require('../helpers/firebase_config')
const bcrypt = require('../helpers/bcrypt_helper')

const validateRequest = (data, fields) => {
  for (const field of fields) {
    if (!data[field]) {
      throw createError.BadRequest(`Missing ${field}`)
    }
  }
}

router.post('/register', async (req, res, next) => {
  try {
    validateRequest(req.body, ['username', 'email', 'password'])
    const { username, email, password } = req.body

    const existingUser = await User.findOneByEmail(email)
    if (existingUser) {
      throw createError.Conflict(`User ${email} is already registered`)
    }

    const hashedPassword = await bcrypt.hashPassword(password)
    const userData = {
      username,
      email,
      password: hashedPassword
    }
    await db.collection('users').add(userData)

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(email),
      signRefreshToken(email)
    ])

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
      // secure: true
    })

    res.send({ accessToken, refreshToken })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    validateRequest(req.body, ['email', 'password'])
    const { email, password } = req.body

    const user = await User.findOneByEmail(email)
    if (!user) {
      throw createError.NotFound(`User ${email} not found`)
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
      throw createError.Unauthorized('Invalid Password')
    }

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(email),
      signRefreshToken(email)
    ])

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
      // secure: true
    })

    res.send({ accessToken, refreshToken })
  } catch (error) {
    next(error)
  }
})

router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies
    if (!refreshToken) throw createError.BadRequest()

    const email = verifyRefreshToken(refreshToken)

    if (!email) throw createError.Unauthorized('Invalid refresh token')

    const accessToken = await signAccessToken(email)
    const newRefreshToken = await signRefreshToken(email)

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    })

    res.send({ accessToken, refreshToken: newRefreshToken })
  } catch (error) {
    next(error)
  }
})

router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies
    if (!refreshToken) throw createError.BadRequest()

    res.clearCookie('refreshToken')

    res.status(200).json({ message: 'Successfully logged out' })
  } catch (error) {
    next(error)
  }
})

module.exports = router
