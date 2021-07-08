const {CartItem} = require('../models');

const getCartItems = async(userId) => {
    return await CartItem.collection().where({
        'user_id': userId
    }).fetch({
        'require': false,
        'withRelated':['product', 'product.category']
    })
}

// check if a product exists in the user's shopping cart
const getCartItemByUserAndProduct = async (userId, productId) => {
    return await CartItem.where({
        'user_id': userId,
        'product_id': productId
    }).fetch({
        'require': false
    })
}

module.exports = { getCartItemByUserAndProduct, getCartItems};