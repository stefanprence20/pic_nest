const { query } = require('express');
const { request } = require('..');
const Media = require('./../models/mediaModel');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const sizeOf = require('image-size');
const Sharp = require('sharp');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');

exports.downloadImage = async (req, res) => {
    const media = await Media.findById(req.params.id);
    const files = fs.createReadStream(`./public/img/medias/${media.image}`);
    res.writeHead(200, {'Content-disposition': 'attachment;filename:img.jpeg'});
    files.pipe(res);
}

//store as a buffer
const multerStorage = multer.memoryStorage();

//check if file is image
const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new console.error('Not an image! Please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadMedia = upload.single('image');

exports.resizeMedia = async (req, res, next) => {
    if(!req.file) return next();

    req.body.image = `category-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        // .resize(500, 500) //(width, height)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/medias/${req.body.image}`);

    const dimensions = sizeOf(`public/img/medias/${req.body.image}`);
    req.body.width = dimensions.width;
    req.body.height = dimensions.height;

    next();
};


exports.getAllMedias = async (req, res) => {
    const medias = await Media.find();
    res.status(201).json({
        status: 'success',
        results: medias.length,
        data: {
            medias
        }
    });
};

/**
 * If we have query params, than return the cropped-on-the-fly media, otherwise return just original media by id
 * /medias/602baeb04b01712e7eac3f99?width=&height=&crop=&quality=&format=
 */

exports.getMedia = async (req, res) => {

    let {width, height} = req.query;

    const media = await Media.findById(req.params.id);

    if(width || height){
        const crop = req.query.crop ? req.query.crop : "contain";
        const quality = req.query.quality ? req.query.quality : 100;
        const format = req.query.format ? req.query.format : "jpeg";

        const mediaStream = fs.createReadStream(`./public/img/medias/${media.image}`);

        const transform = Sharp().resize((width) ? parseInt(width) : null, (height) ? parseInt(height) : null, {
            fit: crop
        }).toFormat(format, {
            quality: parseInt(quality)
        });

        res.set('Content-Type', `image/${format}`);
        mediaStream.pipe(transform).pipe(res);
        return
    }

    return res.status(201).json({
        status: 'success',
        data: {
            media
        }
    });
};

exports.createMedia = async (req, res) => {
        req.body.user = req.user.id;
        const newMedia = await Media.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                media: newMedia
            }
        });
    };

exports.updateMedia = async (req, res) => {
    const findUser = await Media.findById(req.params.id);
    if(findUser.user == req.user.id) {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true
    })
        res.status(201).json({
            status: 'success',
            data: {
                media
            }
        });
    } else {
        return res.json({
            message: 'You have no permission to edit this media!'
        })
    }
};

exports.deleteMedia = async (req, res) => {
    const findUser = await Media.findById(req.params.id);
    if(findUser.user == req.user.id) {
        const media = await Media.findByIdAndDelete(req.params.id, req.body);
        res.status(201).json({
            status: 'success',
            data: null
        });
    } else {
        return res.json({
            message: 'You have no permission to delete this media!'
        })
    }
};

/**
 * Request can be made like /search?title=&page=5&size=1 (using query params)
 */

exports.search = (req, res) => {
    const {page, size, title} = req.query;
    const condition = title
        ? {$text: {$search: title}}
        : {};

    const {limit, offset} = getPagination(page, size);

    const options = {
        select: 'title width height user createdAt updatedAt',
        sort: {createdAt: -1},
        populate: ({path:'categories', select: 'name createdAt updatedAt'}),
        offset: offset,
        limit: limit,
    };

    Media.paginate(condition, options)
        .then((data) => {
            res.send({
                medias: data.docs,
                totalItems: data.totalDocs,
                totalPages: data.totalPages,
                currentPage: data.page,
                hasPrevPage: data.hasPrevPage,
                hasNextPage: data.hasNextPage,
                prevPage: data.prevPage,
                nextPage: data.nextPage,
            });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving medias.",
            });
        });

    // Media.find({
    //     $text: {
    //         $search: req.query.title
    //     }
    // })
    // .sort([['createdAt', -1]])
    // .populate('user','email')
    // .populate('categories','name')
    // .exec()
    // .then(function(media) {
    //     res.json(media);
    // }, function(err) {
    //     next(err);
    // });
}

/**
 * Request can be made like :
 * 1.  /search/random (get a random image from db, caseType=random)
 */

exports.randomSearch = (req, res, next) => {
    Media.count().exec(function (err, count) {
        if (err) {
            return next(err)
        }
        const random = Math.floor(Math.random() * count);

        Media.findOne()
            .skip(random)
            .select('title')
            .populate('user', 'email')
            .populate('categories', 'name')
            .exec()
            .then(function (media) {
                res.json(media);
            }, function (err) {
                next(err);
            })
    })
}

const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = (page > 1) ? (page - 1) * limit : 0;

    return { limit, offset };
};

exports.mediaPaginate = async (req, res, next) => {
    const {page, size} = req.query;
    const {limit, offset} = getPagination(page, size);
    const categoryId = req.params.categories;

    const options = {
        select: 'title width height user createdAt updatedAt',
        sort: {createdAt: -1},
        populate: ({path:'categories user', select: 'name desc createdAt updatedAt lastname email'}),
        offset: offset,
        limit: limit,
    };

    Media.paginate({ categories: categoryId }, options)
        .then((data) => {
            res.send({
                medias: data.docs,
                totalItems: data.totalDocs,
                totalPages: data.totalPages,
                currentPage: data.page,
                hasPrevPage: data.hasPrevPage,
                hasNextPage: data.hasNextPage,
                prevPage: data.prevPage,
                nextPage: data.nextPage,
            });
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving medias.",
            });
        });

}

exports.validateMedia = (req, res, next) => {
    
    const validationRules = [
        check('title').not().isEmpty().trim().escape()
        .withMessage('Title should not be empty!'),
        check('image').not().isEmpty().trim().escape()
        .withMessage('Please upload an image!'),
        check('categories').not().isEmpty().trim().escape()
        .withMessage('Categories should not be empty!'),
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