const User = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

module.exports.register = async (req, res, next) => {
    try {
        const {username, email, password} = req.body
        const usernameCheck = await User.findOne({username})
        if(usernameCheck) {
            return res.json({message: "Username already used!", status: false})
        }
        const emailCheck = await User.findOne({email})
        if(emailCheck) {
            return res.json({message: "Email already exists!", status: false})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            email,
            username,
            password: hashedPassword
        })
        //jwt
        const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET_KEY, {expiresIn: "20s"})
        const refreshToken = jwt.sign({userId: user._id}, process.env.REFRESH_TOKEN_SECRET_KEY, {expiresIn: "7d"})
        res.cookie("accessToken", accessToken, {expires: new Date(Date.now() + 2592000000), sameSite: 'none', secure: true})
        res.cookie("refreshToken", refreshToken, {expires: new Date(Date.now() + 2592000000), sameSite: 'none', secure: true})
        return res.status(201).json({message: "User Registered Successfully!", status: true})
    } catch (e) {
        next(e)
    }
}

module.exports.login = async (req, res, next) => {
    try {
        const {username, password} = req.body
        const user = await User.findOne({username})
        if(!user || !await bcrypt.compare(password, user.password)) {
            return res.json({message: "Incorrect username or password!", status: false})
        }
        const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET_KEY, {expiresIn: "20s"})
        const refreshToken = jwt.sign({userId: user._id}, process.env.REFRESH_TOKEN_SECRET_KEY, {expiresIn: "7d"})
        res.cookie("accessToken", accessToken, {expires: new Date(Date.now() + 2592000000), sameSite: 'none', secure: true})
        res.cookie("refreshToken", refreshToken, {expires: new Date(Date.now() + 2592000000), sameSite: 'none', secure: true})
        return res.json({status: true, message: "User Successfully Logged In!"})
    } catch (e) {
        next(e)
    }
}

module.exports.logout = (req, res) => {
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    return res.json({message: "User Successfully Logged Out!"})
}

module.exports.setAvatar = async (req, res, next) => {
    try {
        const userId = req.user.userId
        const avatarImage = req.body.image
        await User.findByIdAndUpdate(userId, {
            isAvatarImageSet: true,
            avatarImage
        })
        return res.json({isSet: true, msg: "Avatar Image Successfully Set!"})
    } catch (e) {
        next(e)
    }
}

module.exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({_id: {$ne: req.params.id}}).select([
             "_id",
             "username",
             "email",
             "isAvatarImageSet",
             "avatarImage"
        ])
        return res.json(users)
    } catch (e) {
        next(e)
    }
}

module.exports.getCurrentUserDetails = async (req, res) => {
    const user = await User.findOne({_id: req.user.userId}).select([
        "_id",
        "username",
        "email",
        "isAvatarImageSet",
        "avatarImage"
    ])
    return res.json(user)
}