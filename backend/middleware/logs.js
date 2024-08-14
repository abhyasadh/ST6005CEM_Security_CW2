const axios = require('axios');
const https = require('https');

const Api = axios.create({
    baseURL: "https://localhost:5001/api/logs",
  });

const agent = new https.Agent({  
    rejectUnauthorized: false
  });

const logRequests = async (req, res, next) => {

    const logEntry = {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        timestamp: new Date().toISOString(),
        user: req.session ? req.session.user : null,
    };

    try {
        await Api.post('', logEntry, { httpsAgent: agent });
    } catch (error) {
        console.error('Failed to log request:', error.message);
    }

    next();
};


module.exports = { logRequests };