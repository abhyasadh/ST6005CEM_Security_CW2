// Imports
const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv").config();
const mongoose = require('mongoose');
const connectDB = require('./database/db');
const cors = require('cors');
const multiparty = require('connect-multiparty');
const cloudinary = require('cloudinary');
const { initialize } = require('./socketManager');
const http = require("http");

// Making Express App
const app = express();

// CORS Policy
const corsPolicy = {
    origin: ["http://localhost:3000", "https://localhost:3000"],
    credentials: true,
    optionSuccessStatus: 200
}
app.use(cors(corsPolicy))

// Connect to MongoDB
connectDB();

// Body Parser
app.use(express.json());
app.use(multiparty());

// Cloudinary Config
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET,
});

// Server Port
const PORT = process.env.PORT;
const server = app.listen(PORT, ()=>{
    console.log(`Server is running on port: ${PORT}`.white.bold);
});
initialize(server);

// Routes
app.use('/api/user', require('./routes/userRoutes'))
app.use('/api/category', require('./routes/categoryRoutes'))
app.use('/api/food', require('./routes/foodRoutes'))
app.use('/api/order', require('./routes/billRoutes'))
app.use('/api/favourites', require('./routes/favouritesRoutes'))
app.use('/api/tables', require('./routes/tableRoutes'))

// Exporting App
module.exports = app;