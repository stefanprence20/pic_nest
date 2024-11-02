const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');

router.post('/signup', ...authController.validateRegister(), authController.signup);
router.post('/login', authController.login);
router.post('/forget-password', authController.forgot_password);
router.post('/reset-password', authController.reset_password);

module.exports = router;