const {
    getCartItemByUserAndProduct
} = require('../dal/cart_items');
const {
    CartItem
} = require('../models');

class CartServices {
    constructor(user_id) {
        this.user_id = user_id;
    }

    async addToCart(productId, quantity) {

        // check if the product is already in the shopping cart
        let cartItem = await getCartItemByUserAndProduct(this.user_id, productId)

        if (!cartItem) {
            cartItem = new CartItem({
                'user_id': this.user_id,
                'product_id': productId,
                'quantity': quantity
            })
            await cartItem.save();
        } else {
            // cartItem does exist
            cartItem.set('quantity', cartItem.get('quantity') + quantity)
            await cartItem.save();
        }

        return cartItem;

    }
}

module.exports = CartServices;