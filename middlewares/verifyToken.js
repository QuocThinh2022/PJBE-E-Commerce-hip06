const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    // Bearer token
    // header: {authorization: Bearer token}
    if (req.headers?.authorization?.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (error, decode) => {
            if (error) return res.status(401).json({
                success: false,
                message: 'Invalid access token'
            })
            
            req.user = decode;
            next();
        })
    } else {
        return res.status(401).json({
            success: false,
            message: 'Require authentication!!!'
        })
    }
})

const isAdmin = asyncHandler((req, res, next) => {
    const {role} = req.user;
    
    if (role != 'admin')
        return res.status(401).json({
            success: false,
            message: 'Require admin role'
        })
    
    next();
})

module.exports = {
    verifyAccessToken,
    isAdmin
}