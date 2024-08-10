const router = require('express').Router();
const userController = require("../controllers/userController")

router.post('/signup', userController.createUser)
router.post('/login', userController.loginUser)
router.post('/send-otp', userController.sendOtp)
router.post('/verify-otp', userController.verifyOTP)
router.put('/reset-password/:number', userController.resetPassword)

module.exports = router;