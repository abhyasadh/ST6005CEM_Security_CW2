const socket = require("socket.io");

let io;

function initialize(server) {
    io = socket(server, {
        cors: { 
            origin: ["https://localhost:3000"],
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true, 
        },
    });
}

function getIo() {
    if (!io) throw new Error("Socket.io has not been initialized");
    return io;
}

module.exports = { initialize, getIo };