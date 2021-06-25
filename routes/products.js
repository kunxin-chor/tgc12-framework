const express = require('express')
const router = express.Router();

// #1 - import in our model
// if we require a directory (aka folder), nodejs will automatically
// refer to the index.js in that directory
const {Product} = require('../models');

router.get('/', async (req,res)=>{
    // same as: select * from products
    let products = await Product.collection().fetch();
    res.render('products/index', {
        'products': products.toJSON()
    })
})

module.exports = router;