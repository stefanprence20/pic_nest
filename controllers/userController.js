const { query } = require('express');
const { request } = require('..');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const async = require('async');
crypto = require('crypto');
const { check, validationResult } = require('express-validator');

exports.getAllUsers = async (req, res) => {
    const users = await User.find();
    res.status(201).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
};

exports.getUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    res.status(201).json({
        status: 'success',
        data: {
            user
        }
    });
};

exports.createUser = async(req, res, next) => {
        const newUser = await User.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                user: newUser
            }
        });
};

exports.updateUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true
    })
    res.status(201).json({
        status: 'success',
        data: {
            user
        }
    });
};

exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id, req.body);
    res.status(201).json({
        status: 'success',
        data: null
    });
};