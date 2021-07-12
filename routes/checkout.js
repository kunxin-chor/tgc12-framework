const express = require('express');
const CartServices = require('../services/CartServices');
const router = express.Router();

const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser')

router.get('/', async (req, res) => {

    // 1. ask Stripe to create a payment session for us
    // We need to pass over:
    // - line items (i.e, each item in the shopping cart)
    let cartServices = new CartServices(req.session.user.id);
    let cartItems = await cartServices.getCart();
    let lineItems = [];
    let meta = [];
    for (let c of cartItems) {
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
            lineItem['images'] = [c.related('product').get('image_url')]
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
        payment_method_types: ['card'],
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
    res.render('checkout/checkout', {
        'sessionId': stripeSession.id,
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
})

router.get('/success', (req, res) => {
    res.send("Payment successful")
})

router.get('/cancelled', (req, res) => {
    res.send("Payment failed")
})

router.post('/process_payment', bodyParser.raw({
    type: "application/json"
}), (req, res) => {
    // extract out what stripe has sent us
    let payload = req.body;

    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers['stripe-signature'];
    let event;
    try {
        // verify that the payload comes from Stripe
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
        // if no errors, then mean the payload actually comes from Stripe
    } catch (e) {
        res.send({
            'error': e.message
        })
        console.log(e.message);
    }
    if (event.type=="checkout.session.completed") {
        let stripeSession = event.data.object;
        console.log(stripeSession);
        let metaData = stripeSession.metadata;
        let orders = JSON.parse(metaData.orders);
        console.log(orders);

        // todo: process the session
        // some ideas:
        // 1. create a transaction row in the database to store details about payment
        // 2. create an invoice and send to the user
        // 3. deduct the number of stock from the product's stocks in the database
        // ....
    }

    res.send({
        'received': true
    })
})

module.exports = router;