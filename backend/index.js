const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv").config();
const mongoose = require('mongoose');
const connectDB = require('./database/db');
const cors = require('cors');
const multiparty = require('connect-multiparty');
const cloudinary = require('cloudinary');
const { initialize } = require('./socketManager');
const https = require("https");
const fs = require("fs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { logRequests } = require('./middleware/logs');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Connect to MongoDB
connectDB();

// Making Express App
const PORT = process.env.PORT;
const app = express();

const key = fs.readFileSync('../ssl/localhost+2-key.pem');
const cert = fs.readFileSync('../ssl/localhost+2.pem');

// CORS Policy
const corsPolicy = {
  origin: ["https://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsPolicy));
app.use(express.json());
app.use(multiparty());
app.use(mongoSanitize());
app.use(helmet());
app.use(cookieParser());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_URL, // Add your MongoDB URI here
  }),
  cookie: {
    secure: true,
    maxAge: 30000 * 60 * 60 * 24, // 30 Days
    httpOnly: true, // Set to true for better security
  },
}));

// CSRF Protection Middleware
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Serve CSRF token to frontend
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Server Port
const server = https.createServer({ key, cert }, app).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.white.bold);
});
initialize(server);

// Routes
app.use(logRequests);
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/category', require('./routes/categoryRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/order', require('./routes/billRoutes'));
app.use('/api/favourites', require('./routes/favouritesRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));

// Exporting App
module.exports = app;