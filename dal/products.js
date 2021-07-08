
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

const getProductByID = async() => {
    const product = await Product.where({
        'id': productId
    }).fetch({
        'require': true,
        'withRelated': ['category', 'tags']
    })
    return product;
}

module.exports = { getAllCategories, getAllTags, getProductByID }