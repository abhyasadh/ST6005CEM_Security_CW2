const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    tableId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['NOT PAID', 'CASH', 'PAID CASH', 'PAID ONLINE'],
        default: 'NOT PAID'
    },
    orders: [{
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'food',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ['Unseen', 'Seen', 'Completed'],
            default: 'Unseen'
        },
    }],
    time: {
        type: Date,
        required: true,
    },
    checkout: {
        type : Boolean,
        required: true,
        default: false
    }
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;