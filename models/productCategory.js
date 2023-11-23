const mongoose = require('mongoose');

let productCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    thumbnail: {
        type: String,
        default: ""
    }
},{
    timestamps: true
})

module.exports = mongoose.model('ProductCategory', productCategorySchema);