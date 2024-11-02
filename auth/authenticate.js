const config = require('../config/config');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const Role = require("./../models/roleModel");

exports.authenticate = () => {
    return (req, res, next) => {
        // Gather the jwt access token from the request header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) return res.sendStatus(401) // if there isn't any token

        jwt.verify(token, config.secrets.jwt, async (err, decoded_token) => {
            if (err) return res.sendStatus(403);

            try {
                req.user = await User.findById(decoded_token.id)
                next()
            } catch (e) {
                res.status(500).send(e)
            }
        })
    }
}

exports.isAdmin = function () {
    return function (req, res, next) {
        Role.find({_id: req.user.role},
            (err, role) => {
                if (err) {
                    return res.status(500).send({message: err});
                }
                if (role[0].name === "admin") {
                    return next();
                }
                return res.status(403).send({message: "You don't have enough permission to perform this action"});
            });
    }
};
