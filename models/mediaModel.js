const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;

const mediaSchema = new mongoose.Schema({
    title: String,
    image: String,
    width: Number,
    height: Number,
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    categories: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Category' ,
            required: true
        }
    ]
},{
    timestamps: true
});

mediaSchema.index({ title: 'text' });
mediaSchema.plugin(mongoosePaginate);

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;