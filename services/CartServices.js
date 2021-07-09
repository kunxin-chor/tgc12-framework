const { getCartItemByUserAndProduct, getCartItems, addCartItem } = require('../dal/cart_items')

class CartServices {
    constructor(user_id) {
        this.user_id = user_id
    }

    async addProductToCart( product_id) {
        let cartItem = await getCartItemByUserAndProduct(this.user_id, product_id);

        // two cases to carter for:
        if (!cartItem) {
            // 1. the product is being added to cart for the first time
            // take note: cartItem variable is an INSTANCE of the CartItem model
            // so it refes to one ROW
            // in this case ,since we create new instance, it means it will be
            // a NEW row when we save it
            cartItem = await addCartItem(this.user_id, product_id, 1);
        } else {
            // 2. the product is already in the shopping cart
            cartItem.set('quantity', cartItem.get('quantity') + 1)
            await cartItem.save();
        }

    }

    async getCart() {
        let user_id = this.user_id;
        let cartItems = await getCartItems(user_id);
        return cartItems;
    }

    async remove(product_id) {
        let cartItem = await getCartItemByUserAndProduct(this.user_id, product_id)

        if (cartItem) {
            await cartItem.destroy();
            return true;
        }

        return false;
    }

    async updateQuantity(product_id, quantity) {
        let cartItem = await getCartItemByUserAndProduct(this.user_id, product_id);

        if (cartItem) {
            cartItem.set('quantity', quantity);
            await cartItem.save()
            return true;
        } else {
            return false;
        }
    }
}

module.exports = CartServices;