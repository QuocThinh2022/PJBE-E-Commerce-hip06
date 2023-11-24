const Product = require('../models/product');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length == 0) throw new Error('Missing inputs');
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title, {locale: 'vi'});
    const newProduct = await Product.create(req.body);
    return res.status(200).json({
        success: newProduct ? true:false,
        createProduct: newProduct ? newProduct:'Cannot create new product'
    })
})

const getProduct = asyncHandler(async (req, res) => {
    const {pid} = req.params;
    const product = await Product.find({_id: pid, deleted: false});
    return res.status(200).json({
        success: product ? true:false,
        getProduct: product ? product: 'Cannot get product'
    })
})

// filtering, sorting & pagination
const getProducts = asyncHandler(async (req, res) => {
    const queries = {...req.query};
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(item => delete queries[item]);

    let queryString = JSON.stringify(queries).replace(/\b(gte|gt|lt|lte)\b/g, item => `$${item}`);
    let formatedQueries = JSON.parse(queryString);

    // filtering
    if (queries?.title) {
        formatedQueries.title = {$regex: queries.title, $options: 'i'}; 
    }
    let queryCommand = Product.find(formatedQueries);

    // sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        queryCommand = queryCommand.sort(sortBy);
    }

    // fields limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        queryCommand = queryCommand.select(fields);
    }

    //pagination
    let page = +req.query.page || 1; // +'123' => 123
    let limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
    const skip = (page-1)*limit
    queryCommand.skip(skip).limit(limit);

    // execute query
    queryCommand.then(async (response) => {
        const counts = await Product.find(formatedQueries).countDocuments();
        return res.status(200).json({
            success: response ? true:false,
            counts,
            products: response ? response:'Cannot get products'
        })
    }).catch(error => {throw new Error(error.message)})

    // const products = await Product.find({deleted: false});
})

const updateProduct = asyncHandler(async (req, res) => {
    const {pid} = req.params;
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title, {locale: 'vi'});
    const product = await Product.findByIdAndUpdate(pid, req.body, {new: true});
    return res.status(200).json({
        success: product ? true:false,
        updateProduct: product ? product:'Cannot update product'
    })
})

const deleteTempProduct = asyncHandler(async (req, res) => {
    const {pid} = req.params;
    const product = await Product.findByIdAndUpdate(pid, {deleted: true}, {new: true});
    return res.status(200).json({
        success: product ? true:false,
        deleteProduct: product ? product:'Cannot delete product'
    })
})

const undoDeleteProduct = asyncHandler(async (req, res)=> {
    const {pid} = req.params;
    const product = await Product.findByIdAndUpdate(pid, {deleted: false}, {new: true});
    return res.status(200).json({
        success: product ? true: false,
        undoDeleteProduct: product ? product:'Cannot undo delete product'
    })
})

const ratings = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    const {star, comment, pid} = req.body;
    if (!star || !pid) throw new Error('Missing inputs');
    const ratingProduct = await Product.findById(pid);
    const alreadyRating = ratingProduct?.ratings?.find(item => item.postedBy.toString() === _id);
    
    if (alreadyRating) {
        // update star & comment
        await Product.findById(pid).updateOne({
            ratings: {$elemMatch: alreadyRating}
        },{
            $set: {"ratings.$.star": star, "ratings.$.comment": comment}
        }, {new: true})
    } else {
        // add start & comment
        await Product.findByIdAndUpdate(pid, {
            $push: {ratings: {star, comment, postedBy: _id}}
        }, {new: true});
    }

    // sum rating // lay lai du lieu tu product moi vua cap nhat
    let updateProduct = await Product.findById(pid);
    let ratingArr = updateProduct.ratings;
    let rating = ratingArr.reduce((sum, item) => sum + item.star, 0) / ratingArr.length;
    updateProduct.averageRating = rating;
    await updateProduct.save();
    // await Product.findById(pid).updateOne({averageRating: rating});
    return res.status(200).json({
        status: true,
        updateProduct
    })
})

const uploadThumbnailProduct = asyncHandler(async (req, res) => {
    const {pid} = req.params;
    if (!req.file) throw new Error('Missing inputs');
    const response = await Product.findByIdAndUpdate(pid, {thumbnail: req.file.path}, {new: true});
    if (response.images.length == 0) {
        response.images.push(req.file.path);
        response.save();
    }

    return res.status(200).json({
        status: response ? true:false,
        uploadThumbnailProduct: response ? response : "Cannot upload thumbnail product"
    })
})

const uploadImagesProduct = asyncHandler(async (req, res) => {
    const {pid} = req.params;
    if (!req.files) throw new Error('Missing inputs');
    const response = await Product.findByIdAndUpdate(pid, {$push: {images: {$each: req.files.map(item => item.path)}}}, {new: true});

    return res.status(200).json({
        status: response ? true:false,
        uploadImagesProduct: response ? response : 'Cannot upload images product'
    })
})

module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteTempProduct,
    undoDeleteProduct,
    ratings,
    uploadImagesProduct,
    uploadThumbnailProduct

}