const mongoose = require('mongoose');

let orderSchema = new mongoose.Schema({
    products: [{
        product: {type: mongoose.Types.ObjectId, ref: 'Product'},
        count: Number,
        color: String
    }],
    status: {
        type: String,
        default: 'Proccessing',
        enum: ['Cancelled', 'Proccessing', 'Succeed']
    },
    total: Number,
    orderBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Order', orderSchema);