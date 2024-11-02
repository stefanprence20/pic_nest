const { query } = require('express');
const { request } = require('..');
const Category = require('./../models/categoryModel');
const Media = require("../models/mediaModel");
const _ = require('lodash');
const { check, validationResult } = require('express-validator');


exports.getAllCategories = async (req, res) => {
    const categories = await Category.find();
    res.status(201).json({
        status: 'success',
        results: categories.length,
        data: {
            categories
        }
    });
};

exports.getCategory = async (req, res) => {
    const category = await Category.findById(req.params.id);
    res.status(201).json({
        status: 'success',
        data: {
            category
        }
    });
};

exports.createCategory = (req, res, next) => {
    const newCategory = new Category(req.body);

    newCategory.save(function(err, user) {
        if(err) { return next(err);}

        res.status(201).json({
            status: 'success',
            data: {
                category: newCategory
            }
        });
    });
};

exports.updateCategory = async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true
    })
    res.status(201).json({
        status: 'success',
        data: {
            category
        }
    });
};

exports.deleteCategory = async (req, res) => {
    await Category.findByIdAndDelete(req.params.id, req.body);
    res.status(201).json({
        status: 'success',
        data: null
    });
};

/**
 * Search By name field (/category/search?name=)
 */

exports.search = async (req, res, next) => {

    const {name} = req.query;
    const condition = name
        ? {$text: {$search: name}}
        : {};

    let categories;
    let medias;
    let results;

    // try {
    //     categories = await Category.find(condition, ['name'], {sort: {createdAt: -1}}).lean();
    //     results = await Promise.all(categories.map(async category => {
    //         medias = await Media.find({categories: category._id})
    //             .select('title width height user createdAt updatedAt')
    //             .sort([['createdAt', -1]])
    //             .lean();
    //         _.merge(category, {medias: medias});
    //         return category;
    //     }))
    //     res.json(results);
    // } catch (err) {
    //     return next(err);
    // }

    /**
     * Getting data using aggregation (producing same result as above)
     */

    try{
        results = await Category.aggregate()
            .match(condition)
            .lookup({
                from: Media.collection.name,
                localField: '_id',
                foreignField: 'categories',
                as: 'medias'
            })
            .sort({
                "createdAt": -1,
            })
            .project({
                "_id": 1,
                "name": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "medias._id": 1,
                "medias.title": 1,
                "medias.width": 1,
                "medias.height": 1,
                "medias.user": 1,
                "medias.createdAt": 1,
                "medias.updatedAt": 1,
            })
        res.json(results);
    } catch(err){
        return next(err);
    }
}

exports.validateCategory = (req, res, next) => {
    
    const validationRules = [
        check('name').not().isEmpty().trim().escape()
        .withMessage('Name should not be empty!'),
        check('description').not().isEmpty().trim().escape()
        .withMessage('Description should not be empty!'),
        check('slug').not().isEmpty().trim().escape()
        .withMessage('Slug should not be empty!'),
    ]

    const validator = (req, res, next) => {

        const errors = validationResult(req);

        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = []

        errors.array().map(
            err => extractedErrors.push({ [err.param]: err.msg })
        )

        return res.status(422).json({
            errors: extractedErrors,
        })
    }

    return [
        validationRules,
        validator
    ]
}