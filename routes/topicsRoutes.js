const express = require('express');
const topicsController = require('./../controllers/topicsController');

const router = express.Router();

const auth = require('../auth/authenticate');
const checkUser = [auth.authenticate()];

router
    .route('/search')
    .get(topicsController.search);

router
    .route('/')
    .get(checkUser, topicsController.getAllTopics)
    .post(
        checkUser, 
        topicsController.validateTopics(),
        topicsController.createTopics
        );

router
    .route('/:id')
    .get(topicsController.getTopics)
    .patch(checkUser, topicsController.updateTopics)
    .delete(checkUser, topicsController.deleteTopics);

module.exports = router;