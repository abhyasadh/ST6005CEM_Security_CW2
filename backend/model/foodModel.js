const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: true,
        trim: true
    },        
    foodImageUrl: {
        type: String,
        required: true,
    },
    foodPrice: {
        type: Number,
        required: true,
    },
    foodTime: {
        type: Number,
        required: true,
    },
    foodCategory: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'category',
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
        default: true,
    },   
})

const Food = mongoose.model('food', foodSchema);
module.exports = Food;    