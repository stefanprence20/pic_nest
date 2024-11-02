const { request } = require("..");

const express = require('express');
const mediaController = require('./../controllers/mediaController');

const router = express.Router();

const auth = require('../auth/authenticate');
const checkUser = [auth.authenticate()];

router
    .route('/topics/:categories')
    .get( mediaController.mediaPaginate);

router.route('/search').get(mediaController.search);
router.route('/search/:random').get(mediaController.randomSearch);

router
    .route('/')
    .get( mediaController.getAllMedias)
    .post(
        checkUser,
        mediaController.validateMedia(),
        mediaController.uploadMedia,
        mediaController.resizeMedia,
        mediaController.createMedia
    );

router
    .route('/:id')
    .get(mediaController.getMedia)
    .put( 
        checkUser,
        mediaController.uploadMedia,
        mediaController.resizeMedia,
        mediaController.updateMedia 
    )
    .delete( 
        checkUser,
        mediaController.deleteMedia
    );

router
    .route('/:id/download')
    .get(mediaController.downloadImage);

module.exports = router;