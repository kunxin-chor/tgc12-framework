const express = require('express');
const router = express.Router();

const productDataLayer = require('../../dal/products');
const { createProductForm } = require('../../forms');
const { Product } = require('../../models');

router.get('/', async(req,res)=>{
    let products = await productDataLayer.getAllProducts();
    res.json(products.toJSON())
})

router.post('/', async(req,res)=>{
    const allCategories = await productDataLayer.getAllCategories();
    const allTags = await productDataLayer.getAllTags();
    const productForm = createProductForm(allCategories, allTags);

    productForm.handle(req, {
        'empty': async(form) => {
            res.json({
                "error":"Empty form"
            })
        },
        'success': async(form) => {
            // read up on the destructuring objects with spread operator
            let {tags, ...productData} = form.data;
            const product = new Product(productData);
            await product.save();

            if (tags) {
                await product.tags().attach(tags.split(","))
            }
            res.send(product.toJSON()); // res.json(product)
        },
        'error': async(form) => {
            let errors = {};
            // form.fields is a dictionary holding the key/value
            // pairs of all form fields, with the key being the name
            for (let key in form.fields) {
                // if the particular key has error, add it to the errors object
                if (form.fields[key].error) {
                    errors[key] = form.fields[key].error;
                }
            }

            // notify client that there is an error
            res.status(400);
            res.json(errors);
            
        }
    })
})


module.exports = router;