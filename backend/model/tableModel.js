const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true,
        unique: true,
    },        
    status: {
        type: String,
        enum: ['available', 'unavailable', 'requested'],
        required: true,
        default: 'available',
    },  
})

const Tables = mongoose.model('table', tableSchema)
module.exports = Tables