const express = require('express');
const router = express.Router();

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

module.exports = router;