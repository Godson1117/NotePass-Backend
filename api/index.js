const express = require('express')
const app = express()
const cors = require('cors')
const { default: mongoose } = require('mongoose')
require('dotenv').config()

app.use(express.json())
app.use(cors())
app.use(express.static('public'))
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to database")
}).catch(() => {
    console.log("Couldn't connect to database...network error..")
})


app.get('/', (req, res) => {
    req.json({ message: 'NotePass API' })
})

app.use('/auth', require('../routes/auth'))
app.use('/passwords', require('../routes/psswd'))
app.use('/notes', require('../routes/notes'))
app.use('/passwordreset', require('../routes/psswdReset'))

app.listen(8000, () => {
    console.log("Server started on port 8000")
})

module.exports = app