const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const cors = require('cors');
const https = require("https");
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT;

const options = {
    key: fs.readFileSync('../ssl/localhost+2-key.pem'),
    cert: fs.readFileSync('../ssl/localhost+2.pem'),
};

// Middleware to parse JSON bodies
app.use(bodyParser.json());
const corsPolicy = {
    origin: ["https://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}
app.use(cors(corsPolicy));

// Function to rotate logs
const rotateLogs = () => {
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logFile = path.join(logDir, 'api-logs.json');
  const archiveFile = path.join(logDir, `api-logs-${moment().format('YYYYMMDDHHmmss')}.json`);

  if (fs.existsSync(logFile)) {
    fs.renameSync(logFile, archiveFile);
  }
};

// Rotate logs every day at midnight
setInterval(rotateLogs, 24 * 60 * 60 * 1000); // 24 hours

// Server Port
https.createServer(options, app).listen(PORT, () => {
    console.log(`Super Admin Server is running on port ${PORT}`);
});

app.post('/api/logs', (req, res) => {
  const logEntry = req.body;

  // Ensure the logs directory exists
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  // Append log to a file
  const logFile = path.join(logDir, 'api-logs.json');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');

  res.status(200).json({ success: true, message: 'Log received' });
});