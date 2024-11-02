const { request } = require("..");

const express = require('express');
const categoryController = require('./../controllers/categoryController');

const router = express.Router();

const auth = require('../auth/authenticate');
const checkUser = [auth.authenticate()];

router
    .route('/search')
    .get(categoryController.search);

router
    .route('/')
    .get(checkUser, categoryController.getAllCategories)
    .post(
        checkUser, 
        categoryController.validateCategory(),
        categoryController.createCategory
        );

router
    .route('/:id')
    .get(categoryController.getCategory)
    .put(checkUser, categoryController.updateCategory)
    .delete(checkUser, categoryController.deleteCategory);
    
module.exports = router;