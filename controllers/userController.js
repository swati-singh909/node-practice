const userModel = require('../model/userModel')
const userTable = require('../model/userTable')
const httpStatus = require('http-status');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const sessionTable = require('../model/sessionTable');
const middlewareAuth = require('../middlewares/auth')
const bcryptPass = require('../utils/password')
const nodeMailer = require('../utils/helper')

exports.getProfile = async (req, res) => {
    try {
        jwt.verify(req.token, process.env.SECRET_KEY, (err, authData) => {
            if (err) {
                return res.status(202).json({ error: "Token not valid" })
            }
            else {
                res.status(200).json({ authData, message: "Profile accesseed" })
            }
        })
    }
    catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
    }
}

exports.registerUser = async (req, res) => {

    try {
        // const passHash = bcrypt.hash(req.body.password, 10)
        const condition = { email: req.body.email }

        const userExist = await middlewareAuth.findByCondition(condition)
        console.log(userExist)
        if (userExist) {
            return res.status(202).json({ error: "email already exist" })
        }
        const password = await bcryptPass.generateHash(req.body.password)
        const user = await userTable.create({
            email: req.body.email,
            password: password,
            isAdmin: false,
        })

        const token = middlewareAuth.generateJwtToken({
            id: user._id,
            expires_in: process.env.TOKEN_EXPIRES_IN,
            email: req.body.email
        })
        if (token) {
            await sessionTable.create({
                userId: user._id,
                token: token
            })
            return res.status(200).json({ user, token })
        }
        userTable.findOneAndDelete({ email: req.body.email })
        res.status(402).json({ error: "Token not generated" })
    }
    catch (error) {
        return res.status(500).json({ error: "Something went wrong" })
        console.log(error.message)
    }
}

exports.loginUser = async (req, res) => {
    try {
        const condition = { email: req.body.email }
        const userExist = await middlewareAuth.findByCondition(userTable, condition)
        console.log(userExist.password)
        if (userExist) {
            const isAdmin = userExist.isAdmin;
            if (isAdmin) {
                return res.status(202).json({ error: "Admin Account" })
            }
            else {

                const pwd = bcryptPass.comparePassword(req.body.password, userExist.password)
                if (!pwd) {
                    return res.status(202).json({ error: "Password not match" })

                }
                else {
                    if (userExist.isActive) {
                        const token = middlewareAuth.generateJwtToken({
                            id: userExist._id,
                            expires_in: process.env.TOKEN_EXPIRES_IN,
                            email: userExist.email,
                        })
                        if (token) {
                            sessionTable.create({
                                userId: userExist._id,
                                token: token
                            })
                            return res.status(200).json({ userExist, token })
                        }
                        return res.status(202).json({ error: "Something Wrong" })
                    }
                    else {
                        return res.status(200).json({ error: "User is blocked please contact admin" })
                    }

                }
            }

        }
        else {
            return res.status(202).json({ error: "User does not exist" })

        }
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Something went wrong" })
    }
}

exports.logout = async (req, res) => {
    try {
        console.log(req.data.id);
        const condition = { _id: req.data.id }
        const userExist = await middlewareAuth.findByCondition(userTable, condition)
        if (userExist) {   // either the given user is present in user table or not
            const data = await sessionTable.findOneAndDelete({ token: req.token }).lean();
            console.log(data)
            console.log("Session deleted")
            return res.status(200).json({ message: "User Deleted" })
        }
        else {
            res.status(401).json({ error: "Token not valid" });

        }
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Something went wrong" })
    }


}

exports.loginAdmin = async (req, res) => {
    try {
        const condition = { email: req.body.email }
        const userExist = await middlewareAuth.findByCondition(userTable, condition)
        if (userExist) {
            const isAdmin = userExist.isAdmin;
            if (!isAdmin) {
                return res.status(202).json({ error: "User Account" })
            }
            else {
                const pwd = bcryptPass.comparePassword(req.body.password, userExist.password)
                if (!pwd) {
                    return res.status(202).json({ error: "Password not match" })

                }
                const token = middlewareAuth.generateJwtToken({
                    id: userExist._id,
                    expires_in: process.env.TOKEN_EXPIRES_IN,
                    email: userExist.email
                })
                if (token) {
                    sessionTable.create({
                        userId: userExist._id,
                        token: token
                    })
                    return res.status(200).json({ userExist, token })
                }
                return res.status(202).json({ error: "Something Wrong" })
            }

        }
        else {
            return res.status(202).json({ error: "User does not exist" })

        }
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Something went wrong" })
    }
}

exports.blockUser = async (req, res) => {
    try {
        const condition1 = { _id: req.data.id }
        const admin = await middlewareAuth.findByCondition(userTable, condition1)

        const condition2 = { _id: req.params.id }
        const user = await middlewareAuth.findByCondition(userTable, condition2)
        if (admin.isAdmin) {
            if (!user.isAdmin) {
                const update = { isActive: !user.isActive }
                const userUpdate = await userTable.findOneAndUpdate({ _id: req.params.id }, update, { new: true })
                console.log(userUpdate);
                // const active = user.isActive ? "Unblocked" : "Blocked"
                return res.status(200).json({ userUpdate })
            }
            return res.status(401).json({ error: "Admin Cannot be blocked" })

        }
        return res.status(401).json({ error: "Not authorized" })
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Something went wrong" })
    }
}

exports.getUserList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const condition = { _id: req.data.id }
        const admin = await middlewareAuth.findByCondition(userTable, condition)

        if (admin.isAdmin) {
            const condition = { isAdmin: false }
            const userList = await middlewareAuth.getListByCondition(userTable, condition, page, pageSize)
            if (!userList) {

                return res.status(202).json({ error: "List is not present" })

            }
            console.log(userList)
            return res.status(200).json(userList)
            // return res.status(201).JSON.stringify(userList);

        }
        return res.status(401).json({ error: "User cannot access" })

    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Something went wrong" })
    }



}

exports.getAdminList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const condition = { _id: req.data.id }
        const admin = await middlewareAuth.findByCondition(userTable, condition)

        if (admin.isAdmin) {
            const condition = { isAdmin: true }
            const userList = await middlewareAuth.getListByCondition(userTable, condition, page, pageSize)
            if (!userList) {

                return res.status(202).json({ error: "List is not present" })

            }
            console.log(userList)
            return res.status(200).json(userList)
            // return res.status(201).JSON.stringify(userList);

        }
        return res.status(401).json({ error: "User cannot access" })

    }
    catch {
        console.log(error.message)
        return res.status(500).json({ error: "Something went wrong" })
    }


}

exports.changePassword = async (req, res) => {
    try {
        const condition = { _id: req.data.id }
        const user = await middlewareAuth.findByCondition(userTable, condition);
        console.log(user.password)
        if (user) {
            const passwordCorrect = bcryptPass.comparePassword(req.body.oldPassword, user.password)
            if (!passwordCorrect) {
                return res.status(201).json({ error: "Password is not correct" })
            }
            const isNotUniquePassword = bcryptPass.comparePassword(req.body.newPassword, user.password)
            if (isNotUniquePassword) {
                return res.status(201).json({ error: "New Password must be different from old one" })

            }
            const password = await bcryptPass.generateHash(req.body.newPassword)
            const update = { password: password };
            const condition = { email: user.email };
            console.log(condition)
            const updatedUser = await middlewareAuth.updateByCondition(userTable, condition, update);
            if (updatedUser) {
                return res.status(201).json({ msg: " Password Updated Successfully" });
            }
            res.status(202).json({ error: "Could not update Password" })
        }
        return res.status(201).json({ error: "Something went wrong" })
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).json({ error: "Something went wrong" })
    }
}

exports.forgotPassword = async (req, res) => {

    try {
        const condition = { email: req.body.email }
        const emailExist = await middlewareAuth.findByCondition(userTable, condition)
        if (emailExist) {
            req.data = emailExist;
            const msg = await nodeMailer.sendEmail(req.body.email);
            // if(msg) {
                console.log(`messge for send mail ${msg}`)
            return res.status(200).json({ msg: "OTP has been send successfully" })
            // }
            return res.status(201).json({ msg: "Some error occured" })

        }
        return res.status(201).json({ error: "Email does not exist" })
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).json({ error: "Something went wrong" })
    }

}

exports.emailVerification = async (req, res) => {
    try {
        const condition = { email: req.body.email }
        const emailExist = await middlewareAuth.findByCondition(userTable, condition);
        console.log(emailExist)
        if (emailExist) {
            const otp = req.body.otp;
            const otpMatched = nodeMailer.otpVerify(otp);
            console.log(otpMatched)
            if (otpMatched) {
                const token = middlewareAuth.generateJwtToken({
                    id: emailExist._id,
                    expires_in: process.env.TOKEN_EXPIRES_IN,
                    email: emailExist.email
                });
                if (token) {
                    res.status(200).json({ token: token })
                }
                return res.status(201).json({ error: "Something went wrong" })

            }
            else {
                return res.status(201).json({ error: "OTP does not matched" });
            }

        }
        else {
            res.status(201).json({ error: "Email does not exist" })
        }
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).json({ error: "Something went wrong" })
    }

}

exports.resetPassword = async (req, res) => {
    try {
        const condition = { email: req.body.email }
        const emailExist = await middlewareAuth.findByCondition(userTable, condition)
        if (emailExist) {
            const tokenEmail = req.data.email;
            if (tokenEmail === req.body.email) {
                const newPassword = await bcryptPass.generateHash(req.body.newPassword)
                const updatedUser = await middlewareAuth.updateByCondition(userTable, { email: tokenEmail }, { password: newPassword })
                if (updatedUser) {
                    return res.status(200).json({ msg: "Password reset successfully" })
                }
                return res.status(202).json({ error: "Password cannot be reset" })

            }
            return res.status(401).json({ error: "unauthorized access" })

        }
        return res.status(201).json({ error: "Email does not exist" })

    }
    catch {
        console.log(err.message)
        return res.status(500).json({ error: "Something went wrong" })
    }

}



