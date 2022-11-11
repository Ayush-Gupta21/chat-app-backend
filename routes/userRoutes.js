const { isAuthorized } = require("../controllers/authController")
const { register, login, setAvatar, getAllUsers, logout, getCurrentUserDetails } = require("../controllers/userController")

const router = require("express").Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/setAvatar', isAuthorized, setAvatar)
router.get('/allusers/:id', isAuthorized, getAllUsers)
router.get('/', isAuthorized, getCurrentUserDetails)

module.exports = router