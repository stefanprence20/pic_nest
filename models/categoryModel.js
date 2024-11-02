const mongoose = require('mongoose');
var slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const categorySchema = new mongoose.Schema({
    name: String,
    description: String,
    slug: { type: String, slug: "name" }
},{
    timestamps: true
});

categorySchema.index({ name: 'text' });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;