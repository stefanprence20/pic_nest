const { query } = require('express');
const { request } = require('..');
const User = require('../models/userModel');
const Role = require("../models/roleModel");
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const async = require('async');
crypto = require('crypto');
const { check, validationResult } = require('express-validator');

const signToken = id => {
    return jwt.sign({ id: id }, config.secrets.jwt, {
        expiresIn: config.expireTime
    });
}

exports.validateRegister = (req, res, next) => {

    const validationRules = [
        check('name').not().isEmpty().trim().escape()
            .custom(value => !/\s/.test(value))
            .withMessage('No spaces are allowed in the username'),
        check('lastname').not().isEmpty().trim().escape(),
        check('email').isEmail().normalizeEmail(),
        check('password')
            .isLength({ min: 8 })
            .withMessage('Passwords too short')
            .custom((value, {req, loc, path}) => value === req.body.passwordConfirm)
            .withMessage('Passwords do not match')
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

exports.signup = async (req, res, next) => {

    /**
     * If a role name is provided, than get its _id to use when creating a User
     * If a role name is not provided, than assign the basic 'user' role to the user
     */

    const condition = req.body.role
        ? {name: req.body.role}
        : {name: 'user'};

    let role;
    try {
        role = await Role.find(condition);
        if(role.length){
            req.body.role = role[0]._id;

            let user = new User(req.body);

            user = await user.save();

            const token = signToken(user._id);
            return res.status(201).json({
                status: 'success',
                token,
                user
            });

        }
        return res.json({
            message: 'Role does not exist'
        })
    } catch (err) {
        return next(err);
    }
};

exports.forgot_password = function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({
                email: req.body.email
            }).exec(function(err, user) {
                if (user) {
                    done(err, user);
                } else {
                    done('User not found.');
                }
            });
        },
        function(user, done) {
            // create the random token
            crypto.randomBytes(20, function(err, buffer) {
                var token = buffer.toString('hex');
                done(err, user, token);
            });
        },
        function(user, token, done) {
            User.findByIdAndUpdate({ _id: user._id }, { reset_password_token: token, reset_password_expires: Date.now() + 86400000 }, { upsert: true, new: true }).exec(function(err, new_user) {
                done(err, token, new_user);
            });
        },
        function(token, user, done) {
            res.status(201).json({
                status: 'success',
                data: {
                    token: token
                }
            });

        }
    ], function(err) {
        return res.status(422).json({ message: err });
    });
};
exports.reset_password = function(req, res, next) {
    User.findOne({
        reset_password_token: req.body.token,
        reset_password_expires: {
            $gt: Date.now()
        }
    }).exec(function(err, user) {
        if (!err && user) {
            user.password = req.body.password;
            user.passwordConfirm = req.body.passwordConfirm;

            user.save(function(err, user) {
                if (err) {
                    return res.status(422).send({
                        message: err
                    });
                } else {
                    res.status(201).json({
                        status: 'success',
                        data: {
                            user: user
                        }
                    });
                }
            });
        } else {
            return res.status(400).send({
                message: 'Password reset token is invalid or has expired.'
            });
        }
    });
};

exports.login = async(req, res, next) => {
    const { email, password } = req.body;

    //if email and pass exist
    if (!email || !password) {
        res.status(400).send('You need a username and password');
        return;
    }

    //if user exist and pass is correct
    const user = await User.findOne({ email }).select('+password');

    if( !user ||  !(await user.correctPassword(password, user.password))) {
        return res.status(401).send('Incorrect email or password');
    }

    //if everything ok
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
}