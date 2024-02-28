const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    }
})

const Otp = mongoose.model('otps', otpSchema)
module.exports = Otp