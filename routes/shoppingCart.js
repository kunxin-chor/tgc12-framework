const express = require('express');
const router = express.Router();

<<<<<<< HEAD
const CartServices = require('../services/cart_services');

router.get('/', async (req,res)=>{
    res.send("working")
})

router.get('/:product_id/add', async(req,res)=>{
    let cartServices = new CartServices(req.session.user.id);
    cartServices.addToCart(req.params.product_id, 1);
    req.flash('success_messages', "Successfully added to the cart");
    res.redirect('/products')
})

=======
const {CartItem, Product} = require('../models')

const {checkIfAuthenticated} = require('../middlewares');

const {getCartItemByUserAndProduct, getCartItems, addCartItem} = require('../dal/cart_items');
const CartServices = require('../services/CartServices');

router.get('/:product_id/add', checkIfAuthenticated, async(req,res)=>{
    // get the current user id
    let user_id = req.session.user.id;
    let product_id = req.params.product_id;

    // CartItem --> table (because CartItem is the MODEL that represent the cart_items table)
    // check whether the product is already in the shopping cart:
    const cartServices = new CartServices(user_id);
    cartServices.addProductToCart(product_id);

    req.flash('success_messages', "Item has been added to cart")
    res.redirect('/shoppingCart');

})

router.get('/', checkIfAuthenticated, async (req,res)=>{
    let user_id = req.session.user.id;
    const cartServices = new CartServices(user_id);
    let cartItems = await cartServices.getCart();
    res.render('shoppingCart/index',{
        'cartItems': cartItems.toJSON(),
    })
})

router.get('/:product_id/remove', async(req,res)=>{
    let user_id = req.session.user.id;
    let product_id = req.params.product_id;
    const cartServices = new CartServices(user_id);
    let status = await cartServices.remove(product_id);
    if (status) {
        req.flash("success_messages", "Item has been removed")
    } else {
        req.flash("error_messages", "Item not found in cart")
    }
   
    res.redirect('/shoppingCart')
})

router.post('/:product_id/quantity/update', async(req,res)=>{
        let user_id = req.session.user.id;
        let product_id = req.params.product_id;
        let quantity = req.body.quantity;
        const cartServices = new CartServices(user_id);
        let status = await cartServices.updateQuantity(product_id, quantity );

        if (status) {
            req.flash('success_messages', "Update quantity successfully");
        } else {
            req.flash('error_messages', "Failed to update quantity");
        }

        res.redirect('/shoppingCart');
});

>>>>>>> origin/11b-shopping-cart-wip
module.exports = router;