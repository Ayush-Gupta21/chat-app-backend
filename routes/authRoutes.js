const {renewAccessToken} = require("../controllers/authController")

const router = require("express").Router()

router.post('/renewAccessToken', renewAccessToken)

module.exports = router