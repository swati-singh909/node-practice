const mongoose = require('mongoose');

const sessionTable = mongoose.Schema({
    userId : {
        type : mongoose.Types.ObjectId,
        ref : 'userTable',
        required : true
    },
    token : {
        type : String,
    }
},
{
    timestamps : true
});

module.exports = mongoose.model('sessionTable',sessionTable);