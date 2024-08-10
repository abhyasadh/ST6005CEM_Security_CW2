const mongoose = require('mongoose');

const connectDB = ()=>{
    mongoose.connect(process.env.DB_URL).then(()=>{
        console.log(`MongoDB connected!`.yellow.bold.underline);
    })
}

module.exports = connectDB;