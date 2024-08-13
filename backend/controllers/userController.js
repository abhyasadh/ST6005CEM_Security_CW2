const Users = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const client = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const crypto = require('crypto');

// Lockout settings
const MAX_FAILED_ATTEMPTS = 4;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Function to hash phone numbers
function hashPhoneNumber(phoneNumber) {
    return crypto.createHash('sha256').update(phoneNumber).digest('hex');
}

//============================================= FOR OTP VERIFICATION =====================================================

let sharedOTP = '';

const sendOtp = async (req, res) => {
    const { phone, purpose } = req.body;

    if (!phone) {
        return res.json({
            success: false,
            message: "Please enter phone number!",
        });
    }

    sharedOTP = '';
    for (let i = 0; i < 6; i++) {
        sharedOTP += Math.floor(Math.random() * 10);
    }

    const hashedPhone = hashPhoneNumber(phone);

    if (purpose == "Signup") {
        try {
            const sms = async (body) => {
                let msgOptions = {
                    from: process.env.FROM_NUMBER,
                    to: process.env.TO_NUMBER,
                    body,
                };
                try {
                    const message = await client.messages.create(msgOptions);
                    console.log(message);
                } catch (error) {
                    res.json(error);
                }
            };

            console.log(`Your OTP for DishDash account is: ${sharedOTP}`);

            return res.status(200).json({
                success: true,
            });
        } catch (error) {
            res.json(error);
        }
    } else if (purpose == "Reset") {
        try {
            const existingUser = await Users.findOne({ hashedPhone: hashedPhone });
            if (existingUser) {
                const sms = async (body) => {
                    let msgOptions = {
                        from: process.env.FROM_NUMBER,
                        to: process.env.TO_NUMBER,
                        body,
                    };
                    try {
                        const message = await client.messages.create(msgOptions);
                        console.log(message);
                    } catch (error) {
                        res.json(error);
                    }
                };

                sms(`Use this code to reset your password: ${sharedOTP}`);

                return res.status(200).json({
                    success: true,
                });
            } else {
                return res.json({
                    success: false,
                    message: "User not found!",
                });
            }
        } catch (error) {
            res.json(error);
        }
    }
};

const verifyOTP = async (req, res) => {
    const { otp } = req.body;

    if (!otp || otp != sharedOTP) {
        return res.json({
            success: false,
            message: "Incorrect OTP!",
        });
    }

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
            hashedPhone: hashedPhone,
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
        const user = await Users.findOne({ hashedPhone: hashedPhone });
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

        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_TOKEN_SECRET);

        res.status(200).json({
            success: true,
            token: token,
            userData: user,
            message: "Login Successful!",
        });
    } catch (error) {
        console.log(error);
        res.json(error);
    }
};

const resetPassword = async (req, res) => {
    const phone = req.params.number;
    const { password } = req.body;

    if (!phone) {
        return res.json({
            success: false,
            message: "Invalid phone number!",
        });
    }

    try {
        const hashedPhone = hashPhoneNumber(phone);
        const existingUser = await Users.findOne({ hashedPhone: hashedPhone });
        if (!existingUser) {
            return res.json({
                success: false,
                message: "User not found!",
            });
        } else {
            for (let oldPassword of existingUser.previousPasswords) {
                const match = await bcrypt.compare(password, oldPassword);
                if (match) {
                    return res.json({
                        success: false,
                        message: "New password must not be one of the last 5 used passwords.",
                    });
                }
            }

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

module.exports = {
    createUser,
    loginUser,
    sendOtp,
    verifyOTP,
    resetPassword,
};
