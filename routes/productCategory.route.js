const router = require('express').Router();
const controller = require('../controllers/productCategory.controller');
const {verifyAccessToken, isAdmin} = require('../middlewares/verifyToken');

router.post('/', [verifyAccessToken, isAdmin], controller.createProductCategory);
router.get('/', controller.getProductCategories);
router.put('/:pcid', [verifyAccessToken, isAdmin], controller.updateProductCategory);
router.delete('/:pcid', [verifyAccessToken, isAdmin], controller.deleteProductCategory);

module.exports = router;