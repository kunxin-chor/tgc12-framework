
const {
    Product,
    Category,
    Tag
} = require('../models');

const getAllCategories = async() => {
    const categories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });
    return categories;
}

const getAllTags = async() => {
    const tags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
    return tags;
}

module.exports = { getAllCategories, getAllTags }