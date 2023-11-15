const router = require('express').Router();
const {verifyAccessToken} = require('../middlewares/verifyToken');
const controller = require('../controllers/order.controller');

router.post('/', verifyAccessToken, controller.createOrder);

module.exports = router;