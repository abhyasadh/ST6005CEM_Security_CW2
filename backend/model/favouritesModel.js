const mongoose = require('mongoose');

const favouritesSchema = new mongoose.Schema({       
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    foodItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
    }],
})

const Favourites = mongoose.model('favourites', favouritesSchema)

module.exports = Favourites