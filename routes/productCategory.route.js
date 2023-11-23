const router = require('express').Router();
const controller = require('../controllers/productCategory.controller');
const {verifyAccessToken, isAdmin} = require('../middlewares/verifyToken');
const uploader = require('../config/cloudinary.cofig');

router.post('/', [verifyAccessToken, isAdmin], controller.createProductCategory);
router.get('/', controller.getProductCategories);
router.put('/upload-image/:pcid', [verifyAccessToken, isAdmin], uploader.single('thumbnail'), controller.uploadImagesProductCategory);
router.put('/:pcid', [verifyAccessToken, isAdmin], controller.updateProductCategory);
router.delete('/:pcid', [verifyAccessToken, isAdmin], controller.deleteProductCategory);

module.exports = router;