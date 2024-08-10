// Imports
const Users = require("../model/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv").config()
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);


//============================================= FOR OTP VERIFICATION =====================================================

let sharedOTP = '';

const sendOtp = async (req, res) => {

    const { phone, purpose } = req.body;

    if (!phone){
        return res.json({
            success: false,
            message: "Please enter phone number!"
        })
    }

    sharedOTP = '';
    for (let i = 0; i < 6; i++) {
        sharedOTP += Math.floor(Math.random() * 10)
    }

    if (purpose=="Signup"){
        try {
            const sms = async (body) => {
                let msgOptions = {
                    from: process.env.FROM_NUMBER,
                    to: process.env.TO_NUMBER,
                    body
                }
                try {
                    const message = await client.messages.create(msgOptions)
                    console.log(message)
                } catch (error) {
                    res.json(error)
                }
            }

            console.log(`Your OTP for DishDash account is: ${sharedOTP}`)

            return res.status(200).json({
                success: true,
            })
        } catch (error) {
            res.json(error)
        }
    } else if (purpose=="Reset"){
        try {
            const existingUser = await Users.findOne({phone: phone})
            if (existingUser){
                const sms = async (body) => {
                    let msgOptions = {
                        from: process.env.FROM_NUMBER,
                        to: process.env.TO_NUMBER,
                        body
                    }
                    try {
                        const message = await client.messages.create(msgOptions)
                        console.log(message)
                    } catch (error) {
                        res.json(error)
                    }
                }
    
                sms(`Use this code to reset your password: ${sharedOTP}`)
    
                return res.status(200).json({
                    success: true,
                })
            } else {
                return res.json({
                    success: false,
                    message: "User not found!"
                })
            }
        } catch (error) {
            res.json(error)
        }
    }

}

const verifyOTP = async (req, res) => {
    const { otp } = req.body;

    if (!otp || otp!= sharedOTP){
        return res.json({
            success: false,
            message: "Incorrect OTP!"
        })
    }

    return res.json({
        success: true,
        message: "OTP verified successfully!"
    })
}

//==================================================================================================================


const createUser = async (req, res)=>{

    const {firstName, lastName, phone, password} = req.body

    if(!firstName || !lastName || !phone || !password){
        return res.json({
            success: false,
            message: "Please enter all fields!"
        })
    }

    try {
        const existingUser = await Users.findOne({phone: phone})
        if (existingUser){
            return res.json({
                success: false,
                message: "User already exists!"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const encryptedPassword = await bcrypt.hash(password, salt)

        const newUser = new Users({
            firstName : firstName,
            lastName : lastName,
            phone : phone,
            password : encryptedPassword
        });

        await newUser.save();
        res.status(200).json({
            success: true,
            message: "Registration successful!"
        })

    } catch (error) {
        res.status(500).json(error)
    }
}

const loginUser = async (req, res)=>{

    const {phone, password} = req.body

    if(!phone || !password){
        return res.json({
            success: false,
            message: "Please enter all fields!"
        })
    }

    try {
        const user = await Users.findOne({phone: phone})
        if (!user){
            return res.json({
                success: false,
                message: "Incorrect Phone Number!"
            })
        } 
        
        const result = await bcrypt.compare(password, user.password)
        if (!result) {
            return res.json({
                success: false,
                message: "Incorrect Password!"
            })
        }

        const token = jwt.sign({id: user._id, isAdmin: user.isAdmin}, process.env.JWT_TOKEN_SECRET)

        res.status(200).json({
            success: true,
            token: token,
            userData: user,
            message: "Login Successful!"
        })

    } catch (error) {
        console.log(error)
        res.json(error)
    }
}

const resetPassword = async (req, res) => {
    const phone = req.params.number;
    const { password } = req.body;

    if (!phone){
        return res.json({
            success: false,
            message: "Invalid phone number!"
        })
    }

    try {
        const existingUser = await Users.findOne({phone: phone})
        if (!existingUser){
            return res.json({
                success: false,
                message: "User not found!"
            })
        } else {
            const salt = await bcrypt.genSalt(10)
            const encryptedPassword = await bcrypt.hash(password, salt)

            existingUser.password = encryptedPassword
            await existingUser.save()

            return res.status(200).json({
                success: true,
                message: "Password reset successfully!"
            })
        }
    } catch (error) {
        console.log(error)
        res.json(error)
    }
};

module.exports = {
    createUser, loginUser, sendOtp, verifyOTP, resetPassword
}