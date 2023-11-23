const userModel = require('../model/userModel')
const userTable = require('../model/userTable')
const sessionTable = require('../model/sessionTable');
const jwt = require('jsonwebtoken')

// function to verify the token
exports.verifyAuthToken = async(req, res, next) => {
    try {
        const token = req.headers.authorization
        if (typeof token != undefined) {
            const bearer = token.split(" ")
            const bearerToken = bearer[1]
            jwt.verify(bearerToken, process.env.SECRET_KEY, async(err, authData) => {
                if(err) {
                    let msgCode = "INVALID_TOKEN";
                    if(err.message === "jwt expired") {
                        msgCode = "TOKEN EXPIRED";
                    }
                    return res.status(401).json({ error: msgCode })
                }

                const checkJwt =  await sessionTable.findOne({token : bearerToken})
                if(!checkJwt) {
                    return res.status(401).json({error : "TOKEN Not in session table"});
                } 
                req.data = authData ;
                req.token = bearerToken;
                console.log(req.data)
                return next();
            })
            // return next()
        }
        else {
            return res.status(401).json({ error: "Missing Token" })
        }
    }
    catch (error) {
        return res.status(101).json({ error: error.message })
    }

}

/// function to generate  jwt token

exports.generateJwtToken = (payload) => {
    const {expires_in, ...params} = payload;
    const token = jwt.sign(params, process.env.SECRET_KEY, {expiresIn :expires_in});
    if(!jwt) {
        return false;
    }
    return token;

}

exports.getListByCondition = async(Model, condition, page, pageSize) => {
    const userList = await Model.find(condition).skip((page - 1)*pageSize).limit(pageSize);
    console.log(userList)
    if(!userList) {
        return false
    }
    return userList;
}

exports.findByCondition = async(Model, condition) => {
    try {
        const data = await Model.findOne(condition);
        return data || null;
    }
    catch (error) {
        return false;
    }
}

exports.updateByCondition = async(Model, condition, updatedValue) => {
    const updatedData = await Model.updateOne(condition,  { $set: updatedValue }, {new : true});
    // console.log(updatedData)
    if(updatedData) {
        return updatedData;
    }
    return false

}

exports.verifyToken = async(req,res,next) => {
    try {
        const token = req.headers.authorization
        if (typeof token != undefined) {
            const bearer = token.split(" ")
            const bearerToken = bearer[1]
            jwt.verify(bearerToken, process.env.SECRET_KEY, async(err, authData) => {
                if(err) {
                    let msgCode = "INVALID_TOKEN";
                    if(err.message === "jwt expired") {
                        msgCode = "TOKEN EXPIRED";
                    }
                    return res.status(401).json({ error: msgCode })
                }
                req.data = authData
                return next();
            })
        }
        else {
            return res.status(401).json({ error: "Missing Token" })
        }
    }
    catch (err) {
        return res.status(101).json({ error: error.message })
    }

}