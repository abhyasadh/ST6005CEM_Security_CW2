const express = require('express');
const router = express.Router();
const tableController = require("../controllers/tableController");
const { getIo } = require('../socketManager');
const { authGuardAdmin } = require('../middleware/authGuard');

// Initialize Socket.IO
const io = getIo();

// Setup Socket.IO event listeners
io.on("connection", (socket) => {
    // Handle table request
    socket.on("Request Table", async (tableId) => {
        try {
            if (await tableController.getTableStatus(tableId)) {
                await tableController.updateTableStatus(tableId, 'requested');
                io.emit("Table Request", tableId);
            } else {
                io.emit("Table Request Rejected", tableId);
            }
        } catch (error) {
            console.error("Error handling table request:", error);
            io.emit("Table Request Error", { tableId, error: "Internal Server Error" });
        }
    });

    // Handle accepted table request
    socket.on("Accepted Table Request", async (tableId) => {
        try {
            if (await tableController.updateTableStatus(tableId, 'unavailable')) {
                io.emit("Table Request Accepted", tableId);
            } else {
                io.emit("Table Request Rejected", tableId);
            }
        } catch (error) {
            console.error("Error accepting table request:", error);
            io.emit("Table Request Error", { tableId, error: "Internal Server Error" });
        }
    });

    // Handle declined table request
    socket.on("Declined Table Request", async (tableId) => {
        try {
            await tableController.updateTableStatus(tableId, 'available');
            io.emit("Table Request Rejected", tableId);
        } catch (error) {
            console.error("Error declining table request:", error);
            io.emit("Table Request Error", { tableId, error: "Internal Server Error" });
        }
    });

    // Handle case when a customer leaves without ordering
    socket.on("Left Without Order", async (tableId) => {
        try {
            await tableController.updateTableStatus(tableId, 'available');
        } catch (error) {
            console.error("Error updating table status after customer leaves:", error);
        }
    });

    // Handle waiter request
    socket.on("Waiter Request", (tableId) => {
        console.log("Waiter Requested");
        io.emit("Waiter Requested", tableId);
    });
});

// Express routes for table management
function methodNotAllowed(req, res) {
    res.status(405).json({ message: "Method Not Allowed" });
}

// Define routes
router.route("/get-tables/:status")
    .get(authGuardAdmin, tableController.getTables)
    .all(methodNotAllowed);

module.exports = router;