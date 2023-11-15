const userRouter = require('./user.route');
const productRouter = require('./product.route');
const productCategoryRouter = require('./productCategory.route');
const orderRouter = require('./order.route');
const {notFound, errorHandler} = require('../middlewares/errorHandler');

const initRoutes = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/product', productRouter);
    app.use('/api/product-category', productCategoryRouter);
    app.use('/api/order', orderRouter);

    app.use(notFound);
    // app.use(errorHandler);
}

module.exports = initRoutes;