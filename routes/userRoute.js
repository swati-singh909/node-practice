const bodyParser = require('body-parser')
const express = require('express')
const userController = require('../controllers/userController')
const middlewareAuth = require('../middlewares/auth')

const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({extended : true}))

// app.get('/getProfile',middlewareAuth.verifyToken ,userController.getProfile)
app.post('/registerUser', userController.registerUser)
app.post('/loginUser',userController.loginUser)
app.post('/loginAdmin',userController.loginAdmin)
app.post('/blockUser/:id', middlewareAuth.verifyAuthToken, userController.blockUser)
app.post('/logOut', middlewareAuth.verifyAuthToken, userController.logout)
app.get('/getUserList', middlewareAuth.verifyAuthToken,userController.getUserList)
app.get('/getAdminList', middlewareAuth.verifyAuthToken,userController.getAdminList)
app.patch('/changePassword', middlewareAuth.verifyAuthToken, userController.changePassword)
app.post('/forgotPassword',userController.forgotPassword)
app.post('/emailVerification', userController.emailVerification)
app.patch('/resetPassword', middlewareAuth.verifyToken, userController.resetPassword)

module.exports = app