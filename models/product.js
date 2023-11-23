const mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'ProductCategory'
    },
    quantity: {
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String,
        default: "https://res.cloudinary.com/deqclwsve/image/upload/v1700020857/cld-sample-2.jpg"
    },
    images: {
        type: Array,
        default: []
    },
    color: {
        type: String,
        enum: ['Black', 'Grown', 'Red']
    },
    ratings: [
        {
            star: {type: Number},
            postedBy: {type: mongoose.Types.ObjectId, ref: 'User'},
            comment: {type: String}
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('Product', productSchema);