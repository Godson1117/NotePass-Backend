const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyUser = (req, res, next) => {
    const authtoken = req.header('authtoken')
    const payload = jwt.verify(authtoken, process.env.JWT_KEY)
    req.user = payload.cuser
    next()
}

module.exports = verifyUser