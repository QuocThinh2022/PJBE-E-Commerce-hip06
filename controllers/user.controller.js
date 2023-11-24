const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const {generateAccessToken, generateRefreshToken} = require('../middlewares/jwt');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const crypto = require('crypto');
const { pid } = require('process');

const register = asyncHandler(async (req, res) => {
    const {email, password, firstName, lastName} = req.body;
    if (!email || !password || !lastName || !firstName) {
        return res.status(400).json({
            sucess: false,
            mes: 'Missing inputs'
        })
    }
    const user = await User.findOne({email: email});
    if (user){
        throw new Error('User has existed!');
    }
    else {
        const newUser = await User.create(req.body);
        return res.status(200).json({
            sucess: newUser ? true : false,
            mes: newUser ? 'Register is successfully. Please go login!':'Something went wrong.'
        })
    }
})


// refresh token => cap moi access token
// access token => xac thuc nguoi dung, phan quyen nguoi dung 
const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({
            sucess: false,
            mes: 'Missing inputs'
        })
    }
    const response = await User.findOne({email});
    if (response && await response.isCorrectPassword(password)) {
        const {password, role, refreshToken, ...userData} = response.toObject();
        const accessToken = generateAccessToken(response._id, role);
        const newRefreshToken = generateRefreshToken(response._id);
        await User.findByIdAndUpdate(response._id, {refreshToken: newRefreshToken}, {new: true});
        res.cookie('refreshToken', refreshToken, {httpOnly: true, maxAge: 7*24*60*60*1000});
        return res.status(200).json({
            sucess: true,
            token: accessToken,
            userData
        })
    } else {
        throw new Error('Invalid credentials!');
    }
})

const getCurrent = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    const user = await User.findById(_id).select('-refreshToken -password -role');
    return res.status(200).json({
        success: user ? true:false,
        result: user ? user : 'User not found'
    })
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    // Lay token tu cookie
    const cookie = req.cookies;
    // check xem co token hay khong
    if (!cookie && !cookie.refreshToken) throw new Error('No refresh token in cookies');
    // check token co hop le hay khong
    const result = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
    const response = await User.findOne({_id: result._id, refreshToken: cookie.refreshToken});
    return res.status(200).json({
        success: response ? true:false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : 'Refresh token not matched'
    })
})

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie || !cookie.refreshToken) throw new Error('No refresh token in cookies');
    // xoa refresh token o db
    await User.findOneAndUpdate({refreshToken: cookie.refreshToken}, {refreshToken: ''}, {new: true});
    // xoa refresh token o cookie trinh duyet
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    return res.status(200).json({
        success: true,
        message: 'logout is done'
    })
})

// client gui email
// server check email co hop le hay khong => gui mail + kem theo link(password change token)
// client check mail => click link
// client gui api kem token 
// check token co giong voi token ma server gui mail hay khong
// change  password
const forgotPassword = asyncHandler(async (req, res) => {
    const {email} = req.query;
    if (!email) throw new Error('Missing email');
    const user = await User.findOne({email});
    if (!user) throw new Error('User not found');
    const resetToken = user.createPasswordChangedToken();
    await user.save();
    const html = `click vao link de thay doi password. Link het han sau 10p. <a href=${process.env.URL_SERVER}/api/user/reset-password/${resetToken}>Click</a>`;
    const data = {
        email,
        html
    }
    const result = await sendMail(data);
    return res.status(200).json({
        success: true,
        result
    })
})

const resetPassword = asyncHandler(async (req, res) => {
    const {token, password} = req.body;
    if (!token || !password) throw new Error('Mising inputs');
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({passwordResetToken, passwordResetExpires: {$gt: Date.now()}});
    if (!user) throw new Error('Invalid reset token');
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordChangeAt = Date.now();
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json({
        success: user ? true:false,
        message: user ? 'Updated password':'Something went wrong!'
    })

})

const getUsers = asyncHandler(async (req, res) => {
    const response = await User.find().select('-refreshToken -password -role');
    return res.status(200).json({
        success: response ? true:false,
        message: response
    })
})

const deleteUser = asyncHandler(async(req, res) => {
    const {_id} = req.query;
    if (!_id) throw new Error('Missing inputs');
    const response = await User.findByIdAndDelete(_id);
    return res.status(200).json({
        success: response ? true:false,
        deletedUser: response ? `User with emal ${response.email} deleted` : `No user delete`
    })
})

const updateUser = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    if (!_id || Object.keys(req.body).length == 0) throw new Error('Missing inputs');
    const response = await User.findByIdAndUpdate(_id, req.body, {new: true}).select('-password -role');
    return res.status(200).json({
        success: response ? true:false,
        updateUser: response ? response:'Some thing went wrong'
    });
})

const updateUserByAdmin = asyncHandler(async (req, res) => {
    const {uid} = req.params;
    if (Object.keys(req.body).length == 0) throw new Error('Missing inputs');
    const response = await User.findByIdAndUpdate(uid, req.body, {new: true}).select('-password -role');
    return res.status(200).json({
        success: response ? true:false,
        updataUser: response ? response:'Some thing went wrong'
    })
})

const updateUserAddress = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    if (!req.body.address) throw new Error('Missing inputs');
    const response = await User.findByIdAndUpdate(_id, {$push: {address: req.body.address}}, {new: true}).select('-password -role -refreshToken');
    return res.status(200).json({
        status: response ? true:false,
        updateUserAddress: response ? response: 'Cannot update address'
    })
})

const updateCart = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    const {pid, quantity, color} = req.body;
    if (!pid || !quantity || !color) throw new Error('Missing inputs');
    const user = await User.findById(_id).select('cart');
    const alreadyProduct = user?.cart.find(item => item.product.toString() === pid);
    let response;
    if (alreadyProduct && alreadyProduct.color === color) {
        response = await User.updateOne({cart: {$elemMatch: alreadyProduct}}, {$set: {'cart.$.quantity': quantity}}, {new: true});
    } else {
        response = await User.findByIdAndUpdate(_id, {$push: {cart: {product: pid, quantity, color}}}, {new: true});
    }
    return res.status(200).json({
        success: response ? true:false,
        updateUser: response ? response : 'Some thing went wrong'
    })
})
 
module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getUsers,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    updateUserAddress,
    updateCart,
}