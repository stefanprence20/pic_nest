const mongoose = require('mongoose');

const topicsSchema = new mongoose.Schema({
    name: String,
    description: String,
    status: String,
    curator: String
},{
    timestamps: true
});

topicsSchema.index({ name: 'text' });

const Topics = mongoose.model('Topics', topicsSchema);

module.exports = Topics;