const router = require("express").Router()
const cryptoJs = require('crypto-js')
const Password = require('../models/Password')
const verifyUser = require('../midlewares/verifyUser')

router.get('/fetchpasswords', verifyUser, async (req, res) => {
   const decdata = []
   try {
      const data = await Password.find({ userid: req.user.id }).select({ userid: 0 })
      data.forEach((item) => {
         let password = cryptoJs.AES.decrypt(item.password, process.env.ENCKEY).toString(cryptoJs.enc.Utf8)
         decdata.push({ id: item._id, date: item.date, sitename: item.sitename, sitelink: item.sitelink, password: password })
      })
      res.json(decdata)
   }
   catch (e) {
      console.log(e)
      res.json({ message: "An error occured while fetching passwords..." })
   }
})

router.post('/storepassword', verifyUser, async (req, res) => {
   try {
      let encPass = cryptoJs.AES.encrypt(req.body.password, process.env.ENCKEY).toString()
      await Password.create({
         date: new Date(),
         userid: req.user.id,
         sitelink: req.body.sitelink,
         sitename: req.body.sitename,
         password: encPass
      })
      res.json({ success: true, message: "Password succesfully stored" })
   }
   catch (e) {
      console.log(e)
      res.json({ success: false, message: "Internal Server Error...Password not stored" })
   }
})

router.put('/updatepassword/:id', verifyUser, async (req, res) => {
   try {
      const newPass = cryptoJs.AES.encrypt(req.body.password, process.env.ENCKEY)
      let updatedData = {}
      updatedData.sitename = req.body.sitename
      updatedData.sitelink = req.body.sitelink
      updatedData.date = new Date()
      updatedData.password = newPass.toString()
      await Password.findByIdAndUpdate(req.params.id, { $set: updatedData })
      res.json(updatedData)
   }
   catch (e) {
      console.log(e)
      res.json({ message: "Internl server error...can't update" })
   }
})

router.delete('/deletepassword/:id', verifyUser, async (req, res) => {
   try {
      await Password.findByIdAndDelete(req.params.id)
      res.json({ message: "Successfully deleted the password" })
   }
   catch (e) {
      console.log(e)
      res.json({ message: "Internal server error...can't delete the password" })
   }
})

module.exports = router