const express = require('express');
const likeController = require('../controllers/likeController');

const router = express.Router();

const auth = require('../auth/authenticate');
const checkUser = [auth.authenticate()];

router
    .route('/')
    .get(checkUser, likeController.getAllLikes)
    .post(checkUser, likeController.createLike);

router
    .route('/:id')
    .delete(checkUser ,likeController.dislike);

router
    .route('/media')
    .post(checkUser, likeController.createLike)
    .get(checkUser ,likeController.getLikesByMedia);

    
module.exports = router;