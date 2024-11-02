const Wishlist = require('../models/wishlistModel');

/**
 * @param req
 * @param res
 * @returns {Promise<void>}
 * Returns all the public lists of other users || public/private lists of logged in user
 * Private lists of all other users can be seen only using direct link (getList action)
 */
exports.getAllLists = async (req, res) => {

    let condition = {$or:[{privacy: "public"},{user: req.user._id}]};

    const wishLists = await Wishlist.find(condition)
        .populate('user','email')
        .populate('medias','title');
    res.status(201).json({
        status: 'success',
        results: wishLists.length,
        data: {
            wishLists
        }
    });
};

exports.addMediaToList = async (req, res, next) => {
    const {
       listName , description, mediaIds
    } = req.body;

    try {
        let wishList = await Wishlist.findOne({name: listName});

        if (wishList) {
            /**
             * Users can not update every list but only those belonging to them
             */
            if(!wishList.user.equals(req.user._id)){
                return res.status(403).send({message: "You don't have enough permission to perform this action"});
            }
            for (const mediaId of mediaIds) {
                if (!wishList.medias.includes(mediaId)) {
                    wishList.medias.push(mediaId);
                    await wishList.save();
                }
            }
            return res.status(201).json({
                status: 'success',
                wishList
            });
        }

        const wishListData = {
            name: listName,
            description: description,
            medias: mediaIds,
            user: req.user._id
        };
        wishList = new Wishlist(wishListData);
        wishList = await wishList.save();
        return res.status(201).json({
            status: 'success',
            wishList
        });
    } catch (error) {
        return next(error);
    }
}

exports.removeMediaFromList = async function (req, res, next) {
    const {
        listName, mediaIds
    } = req.body;

    try {
        let wishList = await Wishlist.findOne({name: listName});

        if (!wishList) {
            return res.json({
                message: 'Please give an existing list name'
            })
        } else {
            /**
             * Users can not update every list but only those belonging to them
             */
            if(!wishList.user.equals(req.user._id)){
                return res.status(403).send({message: "You don't have enough permission to perform this action"});
            }
            for (const mediaId of mediaIds) {
                if (wishList.medias.includes(mediaId)) {
                    wishList.medias.splice(wishList.medias.indexOf(mediaId),1);
                    await wishList.save();
                }
            }
            return res.status(201).json({
                status: 'success',
                wishList
            });
        }
    } catch (error) {
        return next(error);
    }
}

exports.getList = async (req, res, next) => {
    try{
        const wishList = await Wishlist.findById(req.params.id)
            .populate('user','email')
            .populate('medias','title');
        if (!wishList) {
            return res.json({
                message: 'List does not exist'
            })
        }
        res.status(201).json({
            status: 'success',
            data: {
                wishList
            }
        });
    } catch (err) {
        return next(err);
    }
}

exports.updateList = async (req, res, next) => {
    try{
        let wishList = await Wishlist.findById(req.params.id);
        if(!wishList.user.equals(req.user._id)){
            return res.status(403).send({message: "You don't have enough permission to perform this action"});
        }
        wishList = await Wishlist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(201).json({
            status: 'success',
            data: {
                wishList
            }
        });
    } catch(err) {
        return next(err);
    }
};

exports.emptyList = async (req, res, next) => {
    try {
        let wishList = await Wishlist.findById(req.params.id);
        if (!wishList){
            return res.json({
                message: 'List does not exist'
            })
        }
        if(!wishList.user.equals(req.user._id)){
            return res.status(403).send({message: "You don't have enough permission to perform this action"});
        }
        wishList = await Wishlist.findByIdAndDelete(req.params.id, req.body);
        res.status(201).json({
            status: 'success',
            data: wishList
        });
    } catch (err) {
        return next(err);
    }
}