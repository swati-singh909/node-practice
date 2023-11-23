const mongoose = require('mongoose')
 
const userTable = mongoose.Schema({
    email : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true
    },
    isAdmin : {
        type : Boolean,
        required : true
    },
    isActive : {
        type : Boolean,
        default : true,
    }
},
{
    timestamps : true,
}
);

module.exports = mongoose.model('userTable', userTable);