const Bill = require("../model/billModel");
const { getIo } = require("../socketManager");
const { updateTableStatus } = require("./tableController");
const io = getIo();

const createBill = async (req, res) => {

    const {userId, tableId, orders} = req.body

    if (!userId || !orders || !tableId){
        return res.json({
            success: false,
            message: "Unexpected Error!"
        })
    }

    try {
        const newBill = new Bill({
            userId: userId,
            tableId: tableId,
            time: new Date(),
            orders: orders
        });

        const savedBill = await newBill.save();
        io.emit("New Order", tableId);
        res.status(200).json({
            success: true,
            message: "Orders placed successfully!",
            orderId: savedBill._id
        })
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
    }
}

const addToBill = async (req, res) => {
    const billId = req.params.billId;

    try {
        const bill = await Bill.findById(billId);
        if (!bill) {
            return res.json({
                success: false,
                message: "Unexpected Error!"
            })
        } else {
            const newOrders = Array.isArray(req.body.orders) ? req.body.orders : [];
            bill.orders = bill.orders.concat(newOrders);
            await bill.save();
            io.emit("New Order", bill.tableId);
            res.status(200).json({
                success: true,
                message: "Orders added successfully!",
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
    }
}

const getBillsByTable = async (req, res) => {
    const tableId = req.params.tableId;
    try {
        const bill = await (Bill.findOne({tableId: tableId, checkout: { $ne: true } }).populate('orders.foodId'));
        res.status(200).json({
            success: true,
            message: "Orders fetched successfully!",
            bill: bill
        })
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
    }
}

const getUserOrder = async (req, res) => {
    const userId = req.params.userId;
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 5;

    try {
        const skip = (page - 1) * limit;
        const listOfOrders = await Bill.find({ userId: userId, checkout: true })
                                       .populate('orders.foodId')
                                       .sort({ time: 'desc' })
                                       .skip(skip)
                                       .limit(limit);

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully!",
            bills: listOfOrders,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error");
    }
}


const updateStatus = async (req, res) => {
    const billId = req.params.id;
    const { orderItemId, status } = req.body;

    try {
        const bill = await Bill.findById(billId);

        if (!bill) {
            return res.json({
                success: false,
                message: 'Order not found!'
            });
        }
        
        for (let i = 0; i < bill.orders.length; i++){
            if (bill.orders[i]._id == orderItemId){
                bill.orders[i].status = status;
                break;
            }
        }
        const updatedOrder = await bill.save();

        res.status(200).json({
            success: true,
            message: 'Status Updated!',
            order: updatedOrder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
}

const updatePaymentStatus = async (req, res) => {
    const billId = req.params.id;
    const { status } = req.body;

    try {
        const bill = await Bill.findById(billId);
        if (!bill) {
            return res.json({
                success: false,
                message: 'Order not found!'
            });
        } else {
            bill.status = status;
            switch (status) {
                case "CASH":
                    io.emit("Cash Payment Requested", bill.tableId);
                    break;
                case "PAID ONLINE":
                    io.emit("Online Paid", bill.tableId);
                    break;
                case "PAID CASH":
                    io.emit("Cash Paid", bill.tableId);
                    bill.time = new Date();
                    break;
            }
            const updatedOrder = await bill.save();
            res.status(200).json({
                success: true,
                message: 'Payment Status Updated!',
                order: updatedOrder
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
}

const updateCheckout = async (req, res) => {
    const billId = req.params.id;

    try {
        const bill = await Bill.findById(billId);
        if (!bill) {
            return res.json({
                success: false,
                message: 'Order not found!'
            });
        } else {
            bill.checkout = true;
            const updatedOrder = await bill.save();
            updateTableStatus(bill.tableId, 'available');
            res.status(200).json({
                success: true,
                message: 'Checkout Successful!',
                order: updatedOrder
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
}

const getCheckedOutBillsSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const checkedOutBills = await Bill.find({
            checkout: true,
            time: { $gte: today, $lt: tomorrow }
        }).populate('orders.foodId');

        let totalAmount = 0;
        checkedOutBills.forEach(bill => {
            bill.orders.forEach(order => {
                totalAmount += order.foodId.foodPrice * order.quantity;
            });
        });

        res.status(200).json({
            success: true,
            count: checkedOutBills.length,
            totalAmount: totalAmount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching checked out bills summary"
        });
    }
};

const getHistory = async (req, res) => {
    try {
        const date = new Date(req.params.date);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const checkedOutBills = await Bill.find({
            checkout: true,
            time: { $gte: date, $lt: nextDay }
        }).populate('orders.foodId');

        let totalAmount = 0;
        checkedOutBills.forEach(bill => {
            bill.orders.forEach(order => {
                totalAmount += order.foodId.foodPrice * order.quantity;
            });
        });

        res.status(200).json({
            success: true,
            count: checkedOutBills.length,
            totalAmount: totalAmount,
            bills: checkedOutBills
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching checked out bills summary"
        });
    }
};



const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Orders.findByIdAndDelete(req.params.id);
        if (!deletedOrder){
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Order deleted successfully!"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

module.exports = {
    createBill, addToBill, getBillsByTable, getUserOrder, updateStatus, updatePaymentStatus, updateCheckout, getCheckedOutBillsSummary, getHistory, deleteOrder
}