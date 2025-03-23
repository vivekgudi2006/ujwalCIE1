const mongoose = require('mongoose');
const User = require('./usersmodel');

// Updated bid schema with reference to auction item
const bidSchema = mongoose.Schema({
    name: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String,
    },
    amt: { type: Number, required: true },
    auctionItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Exporting the schema
module.exports = mongoose.model('Bids', bidSchema);