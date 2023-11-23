const express = require('express')
const bodyParser = require('body-parser')
const userModel = require('./model/userModel')
const chatModel = require('./model/chatModel')
const db = require('./connection')
const userRoute = require('./routes/userRoute')



const app = express()
const port = 3002

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.json())

app.use('/', userRoute)

app.listen(port, () => {
    console.log(port)
})


// app.post('/register', async(req, res) => {
//     const userExist = await userModel.findOne({email : req.body.email})
//     if(userExist) {
//         return res.status(202).json({error : "User already exist"})
//     }
//     else {
//         const user = await userModel.create({
//             name : req.body.name,
//             email : req.body.email,
//             password : req.body.password
//         })
//         return res.status(201).json(user)
//     }
// })
