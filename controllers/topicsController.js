const { query } = require('express');
const { request } = require('..');
const Topics = require('./../models/topicsModel');
const { check, validationResult } = require('express-validator');


exports.getAllTopics = async (req, res) => {
    const topics = await Topics.find();
    res.status(201).json({
        status: 'success',
        results: topics.length,
        data: {
            topics
        }
    });
};

exports.getTopics = async (req, res) => {
    const topics = await Topics.findById(req.params.id);
    res.status(201).json({
        status: 'success',
        data: {
            topics
        }
    });
};

exports.createTopics = (req, res, next) => {
    const newTopics = new Topics(req.body);

    newTopics.save(function(err, user) {
        if(err) { return next(err);}

        res.status(201).json({
            status: 'success',
            data: {
                topics: newTopics
            }
        });
    });
};

exports.updateTopics = async (req, res) => {
    const topics = await Topics.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true
    })
    res.status(201).json({
        status: 'success',
        data: {
            topics
        }
    });
};

exports.deleteTopics = async (req, res) => {
    await Topics.findByIdAndDelete(req.params.id, req.body);
    res.status(201).json({
        status: 'success',
        data: null
    });
};

/**
 * Search By name field
 */

exports.search = async (req, res, next) => {
    Topics.find({
        $text: {
            $search: req.query.name
        }
    },
    ['name'],
    {
        sort: {
            createdAt: -1
        }
    }, function (err, result) {
        if (err) return next(err);
        res.json(result);
    })
}

exports.validateTopics = (req, res, next) => {
    
    const validationRules = [
        check('name').not().isEmpty().trim().escape()
        .withMessage('Name should not be empty!'),
        check('description').not().isEmpty().trim().escape()
        .withMessage('Description should not be empty!'),
        check('curator').not().isEmpty().trim().escape()
        .withMessage('Curator should not be empty!'),
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