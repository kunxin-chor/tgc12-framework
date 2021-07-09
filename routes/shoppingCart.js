const express = require('express');
const router = express.Router();

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
        'cartItems': cartItems.toJSON()
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

module.exports = router;