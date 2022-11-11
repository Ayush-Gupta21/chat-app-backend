const jwt = require('jsonwebtoken')

module.exports.isAuthorized = (req, res, next) => {
    const token = req.cookies.accessToken
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
        if(!err) {
            req.user = {userId: user.userId}
            next()
        } else if(err.message == "jwt expired") {
            return res.status(403).json({success: false, message: "Access Token Expired"})
        }
        else {
            return res.status(401).json({message: "User not Authorized"})
        }
    })
}

module.exports.renewAccessToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken) {
        return res.status(401).json({message: "User not Authorized"})
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, (err, user) => {
        if(!err) {
            const accessToken = jwt.sign({userId: user.userId}, process.env.ACCESS_TOKEN_SECRET_KEY, {expiresIn: "20s"})
            res.cookie("accessToken", accessToken, {expiresIn: new Date(Date.now() + 2592000000), sameSite: 'none', secure: true})
            return res.json({success: true, message: "Access Tokken created successfully!"})
        } else {
            return res.status(401).json({success: false, message: "Invalid Refresh Token, User has to Login Again!"})
        }
    })
}