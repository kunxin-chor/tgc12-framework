const express = require('express');
const CartServices = require('../services/CartServices');
const router = express.Router();

const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.get('/', async(req,res) => {

    // 1. ask Stripe to create a payment session for us
    // We need to pass over:
    // - line items (i.e, each item in the shopping cart)
    let cartServices = new CartServices(req.session.user.id);
    let cartItems = await cartServices.getCart();
    let lineItems = [];
    let meta = [];
    for(let c of cartItems) {
        // the keys in the lineItem objects MUST follow
        // stripes guideline
        const lineItem = {
            "name": c.related('product').get('name'),
            "amount": c.related('product').get('cost'),
            "quantity": c.get('quantity'),
            "currency": "SGD"
        }

        // check if the product has image
        if (c.related('product').get('image_url')) {
            lineItem['images'] = [ c.related('product').get('image_url')]
        }

        lineItems.push(lineItem);

        meta.push({
            'product_id': c.get('product_id'),
            'quantity': c.get('quantity')
        })
    }

    // 2. create payment object
    // Create payment object
    // - payment methods (eg. credit card),
    // - the URL to redirect to if payment is successful
    // - the URL to redirect to if the payment fails
    const payment = {
        payment_method_types:['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': JSON.stringify(meta)
        }
    }

    // 3. get session from stripe
    // - extract out the session id from the payment object 
    // (the session is stripe payment session)
    let stripeSession = await Stripe.checkout.sessions.create(payment);
    res.render('checkout/checkout',{
        'sessionId': stripeSession.id,
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
})

router.get('/success', (res, req)=>{
    res.send("Payment successful")
})

router.get('/cancelled', (res,req)=>{
    res.send("Payment failed")
})

module.exports = router;