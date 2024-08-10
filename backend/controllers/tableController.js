const Tables = require("../model/tableModel");

const getTableStatus = async (tableId) => {
    try {
        const requestedTable = await (Tables.findOne({tableNumber: tableId}));
        if (!requestedTable){
            return false;
        } else if (requestedTable.status === 'available'){
            return true;
        } else {
            return false;
        }
    
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
        return false;
    }
}

const updateTableStatus = async (tableId, status) => {
    try {
        const table = await Tables.findOne({tableNumber: tableId});

        if (!table) {
            return false
        }
        
        table.status = status;
        await table.save();
        
        return true;
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
}

const getTables = async (req, res) => {
    const status = req.params.status;
    var tables;
    try {
        status === 'all' ? 
        tables = await (Tables.find()) :
        tables = await (Tables.find({status: status}));
        res.status(200).json({
            success: true,
            message: "Tables fetched successfully!",
            tables: tables
        })
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
    }
}

module.exports = {
    getTableStatus, updateTableStatus, getTables
}