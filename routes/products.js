const express = require('express')
const router = express.Router();
const { bootstrapField, createProductForm} = require('../forms')

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

router.get('/create', async(req,res)=>{
    const productForm = createProductForm();
    res.render('products/create', {
        'form': productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async(req,res)=>{
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async(form) => {
            // create a new instance of the Product model
            // the Product model refers to a table
            // an instance of the Product model refer to one row
            // when we create a new instance of the product model
            // it means we are creating a new row in the products table
            let product = new Product();
            
            // form.data will contain the user's input via the text boxes
            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.cost);
            await product.save();
            res.redirect('/products');
        },
        'error': async(form) => {
            // re-render the form if there is an error
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

module.exports = router;