// Imports
const Users = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const client = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const crypto = require('crypto');

// OTP settings
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_OTP_ATTEMPTS = 3;

// Lockout settings
const MAX_FAILED_ATTEMPTS = 4;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// In-memory store for OTP data (you can use a persistent store like Redis in production)
let otpData = {};

// Function to hash phone numbers
function hashPhoneNumber(phoneNumber) {
    return crypto.createHash('sha256').update(phoneNumber).digest('hex');
}

//============================================= FOR OTP VERIFICATION =====================================================

const getSession = (req, res) => {
    if (req.session.user) {
        return res.status(200).json({ success: true, user: req.session.user });
      }
      return res.status(200).json({ success: false, message: "No active session" });
}

const sendOtp = async (req, res) => {
    const { phone, purpose } = req.body;

    if (!phone) {
        return res.json({
            success: false,
            message: "Please enter phone number!",
        });
    }

    const hashedPhone = hashPhoneNumber(phone);
    let otp = '';
    for (let i = 0; i < 6; i++) {
        otp += Math.floor(Math.random() * 10);
    }

    const otpEntry = {
        otp: otp,
        attempts: 0,
        expiresAt: Date.now() + OTP_EXPIRY_TIME,
    };

    otpData[hashedPhone] = otpEntry;

    try {
        if (purpose === "Reset") {
            const existingUser = await Users.findOne({ hashedPhone: hashedPhone });
            if (!existingUser) {
                return res.json({
                    success: false,
                    message: "User not found!",
                });
            }
        }

        const messageBody = purpose === "Reset" 
            ? `Use this code to reset your password: ${otp}`
            : `Use this code to create account: ${otp}`;

        const msgOptions = {
            from: process.env.FROM_NUMBER,
            to: process.env.TO_NUMBER,
            body: messageBody,
        };

        await client.messages.create(msgOptions);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
};

const verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;
    const hashedPhone = hashPhoneNumber(phone);

    if (!otpData[hashedPhone]) {
        return res.json({
            success: false,
            message: "OTP not found. Please request a new OTP.",
        });
    }

    const { otp: storedOtp, attempts, expiresAt } = otpData[hashedPhone];

    if (Date.now() > expiresAt) {
        delete otpData[hashedPhone]; // Remove expired OTP
        return res.json({
            success: false,
            message: "OTP expired. Please request a new OTP.",
        });
    }

    if (attempts >= MAX_OTP_ATTEMPTS) {
        delete otpData[hashedPhone]; // Remove OTP after max attempts
        return res.json({
            success: false,
            message: "Maximum OTP attempts reached. Please request a new OTP.",
        });
    }

    if (otp !== storedOtp) {
        otpData[hashedPhone].attempts += 1; // Increment failed attempt count
        return res.json({
            success: false,
            message: "Incorrect OTP!",
        });
    }

    // Clear OTP data after successful verification
    delete otpData[hashedPhone];

    // Store the user's phone in session for the next step
    req.session.resetPhone = hashedPhone;

    return res.json({
        success: true,
        message: "OTP verified successfully!",
    });
};

//==================================================================================================================

const createUser = async (req, res) => {
    const { firstName, lastName, phone, password } = req.body;

    let validationErrors = [];

    if (firstName === "" || lastName === "" || phone === "" || password === "") {
        validationErrors.push("All fields are required!");
        return res.json({ success: false, message: validationErrors.join("\n") });
    }
    if (!firstName.match(/^[a-zA-Z]+$/)) {
        validationErrors.push("Invalid first name!");
    }
    if (!lastName.match(/^[a-zA-Z]+$/)) {
        validationErrors.push("Invalid last name!");
    }
    if (!phone.match(/^[0-9]+$/)) {
        validationErrors.push("Invalid phone number!");
    }
    if (!/[A-Z]/.test(password)) {
        validationErrors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
        validationErrors.push("Password must contain at least one lowercase letter.");
    }
    if (!/\d/.test(password)) {
        validationErrors.push("Password must contain at least one number.");
    }
    if (!/[!@#$%^&*()\-=+_{}[\]:;<>,.?/~]/.test(password)) {
        validationErrors.push("Password must contain at least one special character.");
    }
    if (password.length < 8) {
        validationErrors.push("Password must be at least 8 characters long.");
    }
    if (firstName && password.toLowerCase().includes(firstName.toLowerCase())) {
        validationErrors.push("Password should not contain your first name.");
    }
    if (lastName && password.toLowerCase().includes(lastName.toLowerCase())) {
        validationErrors.push("Password should not contain your last name.");
    }
    if (phone && password.includes(phone)) {
        validationErrors.push("Password should not contain your phone number.");
    }
    if (validationErrors.length > 0) return res.json({ success: false, message: validationErrors.join("\n") });

    try {
        const hashedPhone = hashPhoneNumber(phone);
        const existingUser = await Users.findOne({ hashedPhone: hashedPhone });
        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists!",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);

        const newUser = new Users({
            firstName: firstName,
            lastName: lastName,
            phone: hashedPhone,
            password: encryptedPassword,
            previousPasswords: [],
            passwordCreated: new Date(),
            failedLoginAttempts: 0,
            accountLockedUntil: null,
        });

        await newUser.save();
        res.status(200).json({
            success: true,
            message: "Registration successful!",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

const loginUser = async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.json({
            success: false,
            message: "Please enter all fields!",
        });
    }

    try {
        const hashedPhone = hashPhoneNumber(phone);
        const user = await Users.findOne({ phone: hashedPhone });
        if (!user) {
            return res.json({
                success: false,
                message: "Incorrect Phone Number!",
            });
        }

        // Check for account lockout
        if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
            const lockoutTimeRemaining = Math.ceil((user.accountLockedUntil - Date.now()) / 60000); // in minutes
            return res.json({
                success: false,
                message: `Account is locked. Try again in ${lockoutTimeRemaining} minutes.`,
            });
        }

        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
                user.accountLockedUntil = Date.now() + LOCKOUT_DURATION;
                user.failedLoginAttempts = 0;
                await user.save();
                return res.json({
                    success: false,
                    message: "Account is locked due to multiple failed login attempts. Try again later.",
                });
            }
            await user.save();
            return res.json({
                success: false,
                message: "Incorrect Password!",
            });
        }

        // Reset failed attempts on successful login
        user.failedLoginAttempts = 0;
        user.accountLockedUntil = null;

        // Check if password change is required after 90 days
        const daysSincePasswordChange = Math.floor((Date.now() - new Date(user.passwordCreated).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSincePasswordChange > 90) {
            return res.json({
                success: false,
                message: "Password change required. It's been over 90 days since your last password update.",
            });
        }
        
        req.session.user = {
            id: user._id,
            phone: user.phone,
            isAdmin: user.isAdmin,
        };

        res.status(200).json({
            success: true,
            message: "Login Successful!",
            userData: {
                isAdmin: user.isAdmin,
            }
        });
    } catch (error) {
        console.log(error);
        res.json(error);
    }
};

const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "Error logging out." });
        }
        res.clearCookie("connect.sid"); // Clear the session cookie
        res.status(200).json({ success: true, message: "Logged out successfully!" });
    });
};

const resetPassword = async (req, res) => {
    const { password } = req.body;
    const hashedPhone = req.session.resetPhone;

    if (!hashedPhone) {
        return res.json({
            success: false,
            message: "Session expired or invalid session. Please request password reset again.",
        });
    }

    try {
        const existingUser = await Users.findOne({ phone: hashedPhone });
        if (!existingUser) {
            return res.json({
                success: false,
                message: "User not found!",
            });
        } else {
            // Check against previous passwords
            for (let oldPassword of existingUser.previousPasswords) {
                const match = await bcrypt.compare(password, oldPassword);
                if (match) {
                    return res.json({
                        success: false,
                        message: "New password must not be one of the last 5 used passwords.",
                    });
                }
            }

            let validationErrors = [];

            if (!/[A-Z]/.test(password)) {
                validationErrors.push("Password must contain at least one uppercase letter.");
            }
            if (!/[a-z]/.test(password)) {
                validationErrors.push("Password must contain at least one lowercase letter.");
            }
            if (!/\d/.test(password)) {
                validationErrors.push("Password must contain at least one number.");
            }
            if (!/[!@#$%^&*()\-=+_{}[\]:;<>,.?/~]/.test(password)) {
                validationErrors.push("Password must contain at least one special character.");
            }
            if (password.length < 8) {
                validationErrors.push("Password must be at least 8 characters long.");
            }
            if (existingUser.firstName && password.toLowerCase().includes(existingUser.firstName.toLowerCase())) {
                validationErrors.push("Password should not contain your first name.");
            }
            if (existingUser.lastName && password.toLowerCase().includes(existingUser.lastName.toLowerCase())) {
                validationErrors.push("Password should not contain your last name.");
            }
            if (validationErrors.length > 0) return res.json({ success: false, message: validationErrors.join("\n") });

            const salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(password, salt);

            // Update password history
            existingUser.previousPasswords.unshift(existingUser.password);
            if (existingUser.previousPasswords.length > 5) {
                existingUser.previousPasswords.pop(); // Remove the oldest password if we have more than 5
            }
            existingUser.password = encryptedPassword;
            existingUser.passwordCreated = new Date();
            await existingUser.save();

            // Clear the reset session
            delete req.session.resetPhone;

            return res.status(200).json({
                success: true,
                message: "Password reset successfully!",
            });
        }
    } catch (error) {
        console.log(error);
        res.json(error);
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
  
    // Ensure the user is authenticated
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! Please log in.",
      });
    }
  
    try {
      // Fetch the user from the database
      const user = await Users.findById(req.session.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found!",
        });
      }
  
      // Verify the current password
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({
          success: false,
          message: "Incorrect current password!",
        });
      }
  
      let validationErrors = [];

    if (!/[A-Z]/.test(newPassword)) {
        validationErrors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(newPassword)) {
        validationErrors.push("Password must contain at least one lowercase letter.");
    }
    if (!/\d/.test(newPassword)) {
        validationErrors.push("Password must contain at least one number.");
    }
    if (!/[!@#$%^&*()\-=+_{}[\]:;<>,.?/~]/.test(newPassword)) {
        validationErrors.push("Password must contain at least one special character.");
    }
    if (newPassword.length < 8) {
        validationErrors.push("Password must be at least 8 characters long.");
    }
    if (user.firstName && newPassword.toLowerCase().includes(user.firstName.toLowerCase())) {
        validationErrors.push("Password should not contain your first name.");
    }
    if (user.lastName && newPassword.toLowerCase().includes(user.lastName.toLowerCase())) {
        validationErrors.push("Password should not contain your last name.");
    }
    if (validationErrors.length > 0) return res.json({ success: false, message: validationErrors.join("\n") });
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the user's password in the database
      user.password = hashedPassword;
      user.passwordCreated = new Date();
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password changed successfully!",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  };

module.exports = {
    getSession,
    createUser,
    loginUser,
    sendOtp,
    verifyOTP,
    resetPassword,
    changePassword,
    logoutUser,
};