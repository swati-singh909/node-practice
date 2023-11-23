const mongoose = require('mongoose')
require('dotenv').config()

const connectionParams = {
    useNewUrlParser: true,
}

const uri = 'mongodb+srv://swati:Swati1234@cluster0.6pw1ghl.mongodb.net/InstagramBackendDatabase'

const connexion = mongoose.connect(uri, connectionParams).then(() => console.log("connected to cloud atlas")).catch((err) => console.log(err))

module.exports = connexion