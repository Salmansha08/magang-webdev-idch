const admin = require('firebase-admin')
const firestore = admin.firestore()

const bcryptHelper = require('../helpers/bcrypt_helper')

const UserCollection = firestore.collection('users')

class User {
  constructor (email, password) {
    this.email = email
    this.password = password
  }

  static async findOneByEmail (email) {
    const snapshot = await UserCollection.where('email', '==', email).get()
    if (!snapshot.empty) {
      const userData = snapshot.docs[0].data()
      return new User(userData.email, userData.password)
    } else {
      return null
    }
  }

  async save () {
    const hashedPassword = await bcryptHelper.hashPassword(this.password)

    await UserCollection.doc(this.email).set({
      email: this.email,
      password: hashedPassword
    })
  }

  async isPasswordCorrect (password) {
    return await bcryptHelper.comparePassword(password, this.password)
  }
}

module.exports = User
