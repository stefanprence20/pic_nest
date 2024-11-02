const { query } = require('express');
const { request } = require('..');
const Media = require('./../models/mediaModel');
const User = require('./../models/userModel');
const Like = require('./../models/likeModel');


exports.createLike = async (req, res, next) => {
    let media = await Media.findById(req.body.media);
    if (media){
        let user = req.user.id;;
        let data = {
            "media": media,
            "user": user
        }

        const newLike = new Like(data);

        newLike.save(function(err, user) {
            if(err) { return next(err);}

            res.status(201).json({
                status: 'success',
                data: {
                    like: newLike
                }
            });
        });
    } else {
        res.status(400).send('Not a valid media!');
        return;
    }
};

exports.getAllLikes = async (req, res) => {
    const likes = await Like.find();
    res.status(500).json({
        status: 'success',
        results: likes.length,
        data: {
            likes
        }
    });
};

exports.getLikesByMedia = async (req, res) => {
    const likes = await Like.find({
        media: req.body.media
    });
    res.status(500).json({
        status: 'success',
        results: likes.length,
        data: {
            likes
        }
    });
};

exports.dislike = async (req, res) => {
    await Like.findByIdAndDelete(req.params.id, req.body);
    res.status(500).json({
        status: 'success',
        data: null
    });
};