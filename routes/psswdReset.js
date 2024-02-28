const router = require('express').Router()
const nodemailer = require('nodemailer')
const otpGenerator = require('otp-generator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Otp = require('../models/Otp')

router.post('/otpverify', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if (!user) {
            res.json({ success: false, message: "No user Exists with this email" })
        }
        else if (user && req.body.otp == '') {
            const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }

            })
            let mailOptions = {
                from: process.env.EMAIL_USER,
                to: req.body.email,
                subject: 'OTP for Password reset - NotePass',
                text: `Your OTP for Password reset is: ${otp}`
            }
            let info = await transporter.sendMail(mailOptions)
            if (info.accepted.length > 0) {

                await Otp.create({ email: req.body.email, otp })
                res.json({ success: true, message: "OTP send to the registered email" })
            }
            else {
                res.json({ success: false, message: "Invalid Email...!" })

            }
        }
        else {
            const query = await Otp.findOne({ email: req.body.email })
            if (query.otp === req.body.otp) {
                const data = {
                    cuser: {
                        id: user.id
                    }
                }
                const resettoken = jwt.sign(data, process.env.JWT_KEY)
                await Otp.findOneAndDelete({ email: req.body.email })
                res.json({ success: true, message: "OTP verification Successfull", resettoken })
            }
            else {
                res.json({ success: false, message: "Invalid OTP...!" })
            }
        }
    }
    catch (e) {
        res.json({ success: false, message: "Internal Server Error" })
    }
})

router.post('/reset', (req, res, next) => {
    const resettoken = req.header('resettoken')
    const payload = jwt.verify(resettoken, process.env.JWT_KEY)
    req.user = payload.cuser
    next()
}, async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const encPass = await bcrypt.hash(req.body.password, salt)
        await User.findByIdAndUpdate(req.user.id, { $set: { password: encPass } }, { new: true })
        res.json({ success: true, message: "Password successfully reset..." })
    }
    catch (e) {
        res.json({ success: false, message: "Internal Server Error..." })
    }
})

module.exports = router