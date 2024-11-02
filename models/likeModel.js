const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const LikeSchema = new mongoose.Schema({
    media: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media",
    },
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Like', LikeSchema);