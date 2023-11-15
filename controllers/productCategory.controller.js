const ProductCategory = require('../models/productCategory');
const asyncHandler = require('express-async-handler');

const createProductCategory = asyncHandler(async (req, res) => {
    const response = await ProductCategory.create(req.body);
    return res.status(200).json({
        success: response ? true:false,
        createProductCategory: response ? response: 'Cannot create new product-category'
    })
})

const getProductCategories = asyncHandler(async (req, res) => {
    const response = await ProductCategory.find().select('title _id');
    return res.json({
        success: response ? true:false,
        getProductCategories: response ? response: 'Cannot get product-categories'
    })
})

const updateProductCategory = asyncHandler(async (req, res) => {
    const {pcid} = req.params;
    const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, {new: true});
    return res.json({
        succes: response ? true:false,
        updateProductCategories: response ? response:'Cannot update product-category'
    })
})

const deleteProductCategory = asyncHandler(async (req, res) => {
    const {pcid} = req.params;
    const response = await ProductCategory.findByIdAndDelete(pcid);
    return res.json({
        success: response ? true:false,
        deleteProductCategory: response ? response: 'Cannot delete product-category'
    })
})

module.exports = {
    createProductCategory,
    getProductCategories,
    updateProductCategory,
    deleteProductCategory,
}