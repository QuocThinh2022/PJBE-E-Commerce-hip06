const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
//Declare the Schema of the Mongo model
let userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user',
    },
    cart: {
        type: Array,
        default: []
    },
    address: [{
        type: mongoose.Types.ObjectId,
        ref: 'address'
    }],
    wishlist: [{
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    }],
    isBlocked: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
    },
    passwordChangeAt: {
        type: String
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: String
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) // if password khong thay doi
        next();
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
})

userSchema.methods = {
    isCorrectPassword: async function (password) {
        console.log(password, this.password);
        return await bcrypt.compare(password, this.password);
    }
}

module.exports = mongoose.model('User', userSchema);