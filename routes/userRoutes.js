const { request } = require("..");

const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const auth = require('../auth/authenticate');
const permitAdmin = [auth.authenticate(), auth.isAdmin()];

router
    .route('/')
    .get(permitAdmin, userController.getAllUsers)
    .post(...authController.validateRegister(), permitAdmin, userController.createUser);

router
    .route('/:id')
    .get(permitAdmin, userController.getUser)
    .put(permitAdmin, userController.updateUser)
    .delete(permitAdmin ,userController.deleteUser);
    
module.exports = router;