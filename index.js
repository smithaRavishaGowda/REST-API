const express = require('express')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { StatusCodes } = require('http-status-codes')
const connectDb = require('./db/connect')
const PORT = process.env.PORT 
// const connectDb = require('./db/connect')
const expressFileUpload = require('express-fileupload')

//instance
const app = express()

//body parser
app.use(express.urlencoded({extended: false}))//query format of data
app.use(express.json())//json forma+t of data

//
app.use(express.static("public"))
app.use(express.static("build"))

//middleware
app.use(cors())//cross origin resource sharing
app.use(cookieParser(process.env.ACCESS_SECRET))
app.use(expressFileUpload({
    limits: {fileSize: 10 * 1024 * 1024},
    useTempFiles: true
}))

//production controller
if(process.env.SERVER === "production"){
    //executes in production mode
    app.use(`/`, (req, res, next) => {
        return res.sendFile(path.resolve(__dirname, `./build/index.html`))
        next()
    })
}

//api route
app.use(`/api/auth`, require('./route/authRoute'))
app.use(`/api/file`, require('./route/fileRoute'))
app.use(`/api/user`, require('./route/userRoute'))


//default route
app.use(`**`, (req, res) => {
    res.status(StatusCodes.SERVICE_UNAVAILABLE).json({msg: `Requested service path not found`, success: false})
})

//server listen
app.listen(PORT,() => {
    connectDb()
    console.log(`server is started and running @ http://localhost:${PORT}`)
})