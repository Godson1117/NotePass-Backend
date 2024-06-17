const router = require("express").Router()
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const fs = require('fs')
const Note = require('../models/Note')
const verifyUser = require('../midlewares/verifyUser')

cloudinary.config({
    cloud_name: 'dwol08atj',
    api_key: '692224667164546',
    api_secret: 'pIeYCbjeJSKWDKxtXfvAl_LqeBQ'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'attachements'
    }
})

const upload = multer({ storage: storage })

router.get('/fetchnotes', verifyUser, async (req, res) => {

    try {
        const data = await Note.find({ userid: req.user.id }).select({ userid: 0 })
        res.json(data)
    }
    catch (e) {
        console.log(e)
        res.json({ message: "An error occured while fetching notes..." })
    }
})

router.post('/storenote', verifyUser, upload.single('myfile'), async (req, res) => {
    try {
        await Note.create({
            date: new Date().toDateString(),
            userid: req.user.id,
            title: req.body.title,
            description: req.body.description,
            attachement: req.file == undefined ? '' : req.file.path
        })
        console.log(req.file)
        res.json({ success: true, message: "Note succesfully stored" })
    }

    catch (e) {
        console.log(e)
        res.json({ success: false, message: "Internal Server Error...Note not stored" })
    }
})

router.put('/updatenote/:id', verifyUser, upload.single('myfile'), async (req, res) => {
    try {
        let updatedData = {}
        updatedData.title = req.body.title
        updatedData.description = req.body.description
        req.file != undefined ? updatedData.attachement = req.file.path : updatedData.attachement = ''
        updatedData.date = new Date().toDateString()
        await Note.findByIdAndUpdate(req.params.id, { $set: updatedData })
        res.json(updatedData)
    }
    catch (e) {
        console.log(e)
        res.json({ message: "Internl server error...can't update" })
    }
})

router.delete('/deletenote/:id', verifyUser, async (req, res) => {
    try {
        let user = await Note.findById(req.params.id)
        await Note.findByIdAndDelete(req.params.id)
        fs.unlinkSync('public/' + user.attachement)
        res.json({ message: "Successfully deleted the note" })
    }
    catch (e) {
        console.log(e)
        res.json({ message: "Internal server error...can't delete the note" })
    }
})


module.exports = router