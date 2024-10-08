const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController");

// Handler for method not allowed
function methodNotAllowed(req, res) {
    res.status(405).json({ message: "Method Not Allowed" });
}

// Define routes with method not allowed handling
router.route('/session')
    .get(userController.getSession)
    .all(methodNotAllowed);

router.route('/signup')
    .post(userController.createUser)
    .all(methodNotAllowed);

router.route('/login')
    .post(userController.loginUser)
    .all(methodNotAllowed);

router.route('/send-otp')
    .post(userController.sendOtp)
    .all(methodNotAllowed);

router.route('/verify-otp')
    .post(userController.verifyOTP)
    .all(methodNotAllowed);

router.route('/reset-password')
    .put(userController.resetPassword)
    .all(methodNotAllowed);

router.route('/change-password')
    .put(userController.changePassword)
    .all(methodNotAllowed);

router.route('/logout')
    .post(userController.logoutUser)
    .all(methodNotAllowed);

module.exports = router;
