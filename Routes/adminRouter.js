const router = require('express').Router()
const createError = require('http-errors')
require('dotenv').config()
const bcrypt = require('../helpers/bcryptHelper')
const db = require('../helpers/firebaseConfig')
const User = require('../models/userModel')

// Utility function for validation
const validateRequest = (data, fields) => {
  for (const field of fields) {
    if (!data[field]) {
      throw createError.BadRequest(`Missing ${field}`)
    }
  }
}

// Get All Users
router.get('/get-all-users', async (req, res, next) => {
  try {
    const snapshot = await db.collection('users').get()
    const users = snapshot.docs.map((doc) => {
      const userData = doc.data()
      const { password, ...userWithoutPassword } = userData // Mengecualikan field 'password'
      return userWithoutPassword
    })
    res.send(users)
  } catch (error) {
    next(createError.InternalServerError(error.message))
  }
})

// Get User by email
router.post('/get-user', async (req, res, next) => {
  try {
    validateRequest(req.body, ['email'])
    const { email } = req.body

    const snapshot = await db.collection('users').where('email', '==', email).get()
    if (snapshot.empty) {
      throw createError.NotFound(`User ${email} not found`)
    }

    const users = snapshot.docs.map((doc) => {
      const userData = doc.data()
      const { password, ...userWithoutPassword } = userData // Mengecualikan field 'password'
      return userWithoutPassword
    })

    res.send(users)
  } catch (error) {
    next(createError.InternalServerError(error.message))
  }
})

// Create user
router.post('/create-user', async (req, res, next) => {
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

    res.status(201).json({ message: `User ${email} has been created` })
  } catch (error) {
    next(createError.InternalServerError(error.message))
  }
})

// Update profile
router.put('/update-profile', async (req, res, next) => {
  try {
    validateRequest(req.body, ['email', 'newEmail', 'newUsername'])
    const { email, newEmail, newUsername } = req.body

    const userQuerySnapshot = await db.collection('users').where('email', '==', email).get()

    if (userQuerySnapshot.empty) {
      throw createError.NotFound(`User ${email} not found`)
    } else {
      const emailFound = await db.collection('users').where('email', '==', newEmail).get()

      if (!emailFound.empty) {
        throw createError.Conflict(`This ${newEmail} is already registered with other user`)
      } else {
        const docId = userQuerySnapshot.docs[0].id

        const updateData = {
          email: newEmail,
          username: newUsername
        }

        await db.collection('users').doc(docId).update(updateData)

        res.status(200).json({ message: `Profile for user with email ${email} has been updated to ${newEmail}` })
      }
    }
  } catch (error) {
    next(createError.InternalServerError(error.message))
  }
})

// Delete user
router.delete('/delete-user', async (req, res, next) => {
  try {
    validateRequest(req.body, ['email'])
    const { email } = req.body

    const userQuerySnapshot = await db.collection('users').where('email', '==', email).get()

    if (userQuerySnapshot.empty) {
      throw createError.NotFound('User not found')
    }

    const docId = userQuerySnapshot.docs[0].id

    await db.collection('users').doc(docId).delete()

    res.status(200).json({ message: `User with email ${email} has been deleted` })
  } catch (error) {
    next(createError.InternalServerError(error.message))
  }
})

module.exports = router
