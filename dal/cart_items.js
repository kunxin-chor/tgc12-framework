const {CartItem} = require('../models');

const getCartItemByUserAndProduct = async (user_id, product_id) => {
    let cartItem = await CartItem.where({
        'user_id': user_id,
        'product_id': product_id
    }).fetch({
        'require': false // make sure it's false or else there will be an exception if there is no results
    });
    return cartItem;
}

const getCartItems = async (user_id) => {
    let cartItems = await CartItem.collection().where({
        'user_id': user_id
    }).fetch({
        require: false,
        withRelated:['product', 'product.category']
    });
    return cartItems;
}

const addCartItem = async (user_id, product_id, quantity) => {
    let cartItem = new CartItem({
        'user_id': user_id,
        'product_id': product_id,
        'quantity': 1
    })
    await cartItem.save();
}

module.exports = {
    getCartItemByUserAndProduct, getCartItems, addCartItem
}