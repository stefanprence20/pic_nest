const express = require('express');
const wishlistController = require('./../controllers/wishlistController');

const router = express.Router();

const auth = require('../auth/authenticate');
const checkUser = [auth.authenticate()];

router
    .route('/')
    .get(checkUser, wishlistController.getAllLists)

router.post('/add', checkUser, wishlistController.addMediaToList);
router.post('/remove', checkUser, wishlistController.removeMediaFromList);

router
    .route('/:id')
    .get(checkUser, wishlistController.getList)
    .put(checkUser, wishlistController.updateList)
    .delete(checkUser, wishlistController.emptyList);

module.exports = router;