const router = require('express').Router();
const tableController = require("../controllers/tableController");
const { getIo } = require('../socketManager');
const { authGuardAdmin } = require('../middleware/authGuard');

const io = getIo();

io.on("connection", (socket) => {
    socket.on("Request Table", async (tableId) => {
        if (await tableController.getTableStatus(tableId)) {
            tableController.updateTableStatus(tableId, 'requested');
            io.emit("Table Request", tableId);
        } else {
            io.emit("Table Request Rejected", tableId);
        }
    });

    socket.on("Accepted Table Request", async (tableId) => {
        if (await tableController.updateTableStatus(tableId, 'unavailable')){
            io.emit("Table Request Accepted", tableId);
        } else {
            io.emit("Table Request Rejected", tableId);
        }
    });

    socket.on("Declined Table Request", async (tableId) => {
        await tableController.updateTableStatus(tableId, 'available')
        io.emit("Table Request Rejected", tableId);
    });

    socket.on("Left Without Order", async (tableId) => {
        await tableController.updateTableStatus(tableId, 'available');
    });

    socket.on("Waiter Request", (tableId) => {
        console.log("Waiter Requested");
        io.emit("Waiter Requested", tableId);
    });
});

router.get("/get-tables/:status", authGuardAdmin, tableController.getTables)

module.exports = router;