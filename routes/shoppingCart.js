const express = require('express');
const router = express.Router();

const {CartItem} = require('../models')

const {checkIfAuthenticated} = require('../middlewares');

router.get('/:product_id/add', checkIfAuthenticated, async(req,res)=>{
    // get the current user id
    let user_id = req.session.user.id;
    let product_id = req.params.product_id;

    // CartItem --> table (because CartItem is the MODEL that represent the cart_items table)
    // check whether the product is already in the shopping cart:
    let cartItem = await CartItem.where({
        'user_id': user_id,
        'product_id': product_id
    }).fetch({
        'require': false // make sure it's false or else there will be an exception if there is no results
    });

    // two cases to carter for:
    if (!cartItem) {
        // 1. the product is being added to cart for the first time
        // take note: cartItem variable is an INSTANCE of the CartItem model
        // so it refes to one ROW
        // in this case ,since we create new instance, it means it will be
        // a NEW row when we save it
        cartItem = new CartItem({
            'user_id': user_id,
            'product_id': product_id,
            'quantity': 1
        })
        await cartItem.save();
    } else {  
        // 2. the product is already in the shopping cart
        cartItem.set('quantity', cartItem.get('quantity') + 1)
        await cartItem.save();
    }

    req.flash('success_messages', "Item has been added to cart")
    res.redirect('/shoppingCart');

})

router.get('/', checkIfAuthenticated, async (req,res)=>{
    let user_id = req.session.user.id;
    let cartItems = await CartItem.collection().where({
        'user_id': user_id
    }).fetch({
        require: false,
        withRelated:['product', 'product.category']
    })
    res.render('shoppingCart/index',{
        'cartItems': cartItems.toJSON()
    })
})

router.get('/:product_id/remove', async(req,res)=>{
    let user_id = req.session.user.id;
    let product_id = req.params.product_id;
    let cartItem = await CartItem.where({
        'user_id': user_id,
        'product_id': product_id
    }).fetch({
        'require': false // make sure it's false or else there will be an exception if there is no results
    });

    if (cartItem) {
        req.flash('success_messages', "Item removed from cart")
        await cartItem.destroy();
    }

    res.redirect('/shoppingCart')
})

module.exports = router;