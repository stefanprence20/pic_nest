const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name!'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please enter your description!'],
        trim: true
    },
    medias: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Media",
            }
        ],
        required: true,
        validate: {
            validator: function (el) {
                return el == null || el.length > 0;
            },
            message: 'Please provide at least one media!'
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    privacy: {
        type: String,
        enum: ['private', 'public'],
        default: 'public'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('wishlist', wishlistSchema);