const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
     email : {
       type : String,
       required : true
     },
     password : {
        type : String,
        required : true
     },
    //  image : {
    //     type : String,
    //     required : false
    //  },
     is_online : {
        type : String,
        default : '0'
     }
}, 
{timestamps : true }
)

module.exports = mongoose.model('User', userSchema)