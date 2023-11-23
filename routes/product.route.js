const router = require('express').Router();
const controller = require('../controllers/product.controller');
const {verifyAccessToken, isAdmin} = require('../middlewares/verifyToken');
const uploader = require('../config/cloudinary.cofig');

router.post('/',[verifyAccessToken, isAdmin], controller.createProduct);

router.put('/ratings', [verifyAccessToken], controller.ratings);
router.put('/upload-thumbnail/:pid', [verifyAccessToken, isAdmin], uploader.single('thumbnail'), controller.uploadThumbnailProduct);
router.put('/upload-image/:pid', [verifyAccessToken, isAdmin], uploader.array('images', 10), controller.uploadImagesProduct);
router.put('/:pid', [verifyAccessToken, isAdmin], controller.updateProduct);

router.patch('/undo/:pid', [verifyAccessToken, isAdmin], controller.undoDeleteProduct);
router.patch('/:pid', [verifyAccessToken, isAdmin], controller.deleteTempProduct);

router.get('/', controller.getProducts);
router.get('/:pid', controller.getProduct);

module.exports = router