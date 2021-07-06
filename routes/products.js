const express = require('express')
const router = express.Router();
const {
    bootstrapField,
    createProductForm
} = require('../forms')

// #1 - import in our model
// if we require a directory (aka folder), nodejs will automatically
// refer to the index.js in that directory
const {
    Product
} = require('../models');

router.get('/', async (req, res) => {
    // same as: select * from products
    let products = await Product.collection().fetch();
    res.render('products/index', {
        'products': products.toJSON()
    })
})

router.get('/create', async (req, res) => {
    const productForm = createProductForm();
    res.render('products/create', {
        'form': productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
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
        'error': async (form) => {
            // re-render the form if there is an error
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// display the form that displays a product for editing
router.get('/:product_id/update', async (req, res) => {
    // retrieve the product from the database
    const productId = req.params.product_id;

    // fetch the product from the database
    // if we are referring to the MODEL directly, we are accessing the entire table
    // if we are referring to one INSTANCE of the model, we are accessing one row
    const product = await Product.where({
        'id': productId
    }).fetch({
        'require': true
    })

    const productForm = createProductForm();
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })

})

router.post('/:product_id/update', async(req,res)=>{
    // fetch the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        'require': true
    }) 

    // process the form
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async(form)=>{
            product.set(form.data);
            await product.save();
            res.redirect('/products');
        },
        'error': async (form)=>{
            // re-render the form if there are errors
            // to display the error messages
            res.render('products/update', {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })
})

router.get('/:product_id/delete', async(req,res)=>{
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    })

    res.render('products/delete', {
        'product': product.toJSON()
    })
})

router.post('/:product_id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    })

    // use the Bookshelf ORM to delete the product
    await product.destroy();
    res.redirect('/products')
})


module.exports = router;