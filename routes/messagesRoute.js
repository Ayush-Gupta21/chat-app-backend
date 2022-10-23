const { isAuthorized } = require("../controllers/authController")
const { addMsg, getAllMsgs } = require("../controllers/messagesController")

const router = require("express").Router()

router.post('/addmsg', isAuthorized, addMsg)
router.post('/getmsg', isAuthorized, getAllMsgs)

module.exports = router