const express = require('express')
const router = express.Router()
const createError = require('http-errors')

const {
  verifyAccessToken
} = require('../helpers/jwt_helper')

const db = require('../helpers/firebase_config')

router.get('/', verifyAccessToken, async (req, res, next) => {
  try {
    const whmcsUrl = process.env.WHMCS_URL
    const apiIdentifier = process.env.API_IDENTIFIER
    const apiSecret = process.env.API_SECRET

    const postData = {
      api_identifier: apiIdentifier,
      api_secret: apiSecret,
      ...req.body
    }

    const baseURL = whmcsUrl + '/includes/api.php'

    const jsonData = await db.collection('whmcs').doc('data').get()

    // Kalau mau pake axios
    // const response = await axios.post(baseURL, postData);
    // const jsonData = response.data;

    console.log(jsonData)
    res.status(200).json(jsonData)
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const errorMessage =
                error.response.data.message ||
                'Terjadi kesalahan saat melakukan permintaan'

      return next(createError(status, errorMessage))
    } else if (error.request) {
      return next(createError(500, 'Request Error: ' + error.request))
    } else {
      return next(createError(500, 'Error: ' + error.message))
    }
  }
})

module.exports = router
