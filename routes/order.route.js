const router = require('express').Router();
const {verifyAccessToken, isAdmin} = require('../middlewares/verifyToken');
const controller = require('../controllers/order.controller');
const {prefixAdmin} = require('../config/system.config');

router.post('/', verifyAccessToken, controller.createOrder);
router.put('/status/:oid', [verifyAccessToken, isAdmin], controller.updateStatus);
router.get('/', verifyAccessToken, controller.getUserOrder);
router.get(`/${prefixAdmin}`, [verifyAccessToken, isAdmin], controller.getOrder);

module.exports = router;