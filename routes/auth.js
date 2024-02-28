const router = require("express").Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const User = require("../models/User")

router.post('/signup', async (req, res) => {
  let message = "User successfully registered"
  let success = true

  try {
    const useremail = await User.findOne({ email: req.body.email })
    if (useremail) {
      success = false
      message = "A user with same email already exists!"
    }
    else {
      const salt = await bcrypt.genSalt(10)
      const encPass = await bcrypt.hash(req.body.password, salt)
      await User.create({
        email: req.body.email,
        password: encPass
      })
    }
    return res.json({ success, message })
  }
  catch (e) {
    success = false
    message = "Internal Server error"
    return res.status(500).json({ success, message })
  }
})

router.post('/login', async (req, res) => {
  let authtoken = ''
  try {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      const orgPass = await bcrypt.compare(req.body.password, user.password)
      if (orgPass) {
        success = true
        message = "Logged in successfully"
        const data = {
          cuser: {
            id: user.id
          }
        }
        authtoken = jwt.sign(data, process.env.JWT_KEY)
      }
      else {
        success = false
        message = "Invalid Password...Try again!"
      }
    }
    else {
      success = false
      message = "Invalid email...Are you registered?"
    }
    return res.json({ success, message, authtoken, profile: user.email[0].toUpperCase() })
  }
  catch (e) {
    success = false
    message = "Internal Server error"
    return res.status(500).json({ success, message, authtoken, profile: user.profile })
  }
})

router.post('/gauth', async (req, res) => {
  let accessToken = req.body.access_token
  let authtoken = ''
  try {
    let cred = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    })
    let user = await User.findOne({ email: cred.data.email })
    if (!user) {
      await User.create({
        email: cred.data.email
      })
    }
    user = await User.findOne({ email: cred.data.email })
    const data = {
      cuser: {
        id: user.id
      }
    }
    authtoken = jwt.sign(data, process.env.JWT_KEY)
    return res.json({ authtoken, profile: cred.data.picture })
  }
  catch (e) {
    return res.status(500).json({ message: "Internal Server error" })
  }

})

module.exports = router