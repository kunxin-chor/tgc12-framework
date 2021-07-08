const express = require('express')
const router = express.Router();
const {
    bootstrapField,
    createProductForm,
    createSearchForm
} = require('../forms')
const {
    checkIfAuthenticated
} = require('../middlewares')

// #1 - import in our model
// if we require a directory (aka folder), nodejs will automatically
// refer to the index.js in that directory
const {
    Product,
    Category,
    Tag
} = require('../models');

router.get('/', async (req, res) => {

    const categories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });
    categories.unshift([0, "Any categories"])

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    const searchForm = createSearchForm(categories, allTags);

    // mastery query:
    let q = Product.collection();

    searchForm.handle(req, {
        'empty': async (form) => {
            // same as: select * from products
            let products = await q.fetch({
                'withRelated': ['category', 'tags']
            });

            res.render('products/index', {
                'products': products.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async(form) => {
             // same as: select * from products
             let products = await q.fetch({
                'withRelated': ['category', 'tags']
            });

            res.render('products/index', {
                'products': products.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'success': async(form) => {
            console.log(form.data);
            if (form.data.name) {
                q = q.where('name', 'like', '%' + form.data.name + '%')
            }

            // only if the form has min_cost filled in
            if (form.data.min_cost) {
                q = q.where('cost', '>=', form.data.min_cost);
            }

            // only if the form has max_cost filled in
            if (form.data.max_cost) {
                q = q.where('cost', '<=', form.data.max_cost);
            }

            if (form.data.category_id && form.data.category_id != "0") {
                q = q.where('category_id', '=', form.data.category_id);
            }

            if (form.data.tags) {
                console.log("Got executed");
                console.log(form.data.tags.split(','))
                // select * from products join products_tags on products.id = products_tags.product_id
                q = q.query('join', 'products_tags', 'products.id', 'product_id')
                    .where('tag_id', 'in', form.data.tags.split(','))
            }

            // For debugging:
            // console.log(q.query().toSQL());

            let products = await q.fetch({
                withRelated:['category', 'tags']
            });

            res.render('products/index', {
                'products': products.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        }
    })


})

router.get('/create', checkIfAuthenticated, async (req, res) => {

    // get all the categories from the database
    // const choices = await Category.fetchAll().map((category)=>{
    //     return [ category.get('id'), category.get('name')]
    // });

    const allCateogries = await Category.fetchAll();
    const choices = [];
    for (let category of allCateogries) {
        choices.push([category.get('id'), category.get('name')])
    }

    // load in all the possible tags
    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
    const productForm = createProductForm(choices, allTags);

    res.render('products/create', {
        'form': productForm.toHTML(bootstrapField),
        'cloudinaryName': process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryPreset': process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/create', checkIfAuthenticated, async (req, res) => {
    const choices = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    const productForm = createProductForm(choices, allTags);
    productForm.handle(req, {
        'success': async (form) => {
            // create a new instance of the Product model
            // the Product model refers to a table
            // an instance of the Product model refer to one row
            // when we create a new instance of the product model
            // it means we are creating a new row in the products table
            // form.data will contain the user's input via the text boxes
            console.log(form.data);
            let {
                tags,
                ...productData
            } = form.data;
            let product = new Product(productData);
            await product.save();

            if (tags) {
                // convert comma seperated strings into array
                let selectedTags = tags.split(",");
                // associate product with the tags
                await product.tags().attach(selectedTags);
            }
            req.flash("success_messages", `New product ${product.get('name')} has been created successfully!`)
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// display the form that displays a product for editing
router.get('/:product_id/update', async (req, res) => {
    const choices = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });

    // retrieve all the tags
    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    // retrieve the product from the database
    const productId = req.params.product_id;

    // fetch the product from the database
    // if we are referring to the MODEL directly, we are accessing the entire table
    // if we are referring to one INSTANCE of the model, we are accessing one row
    const product = await Product.where({
        'id': productId
    }).fetch({
        'require': true,
        'withRelated': ['category', 'tags']
    })

    const productForm = createProductForm(choices, allTags);
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.category_id.value = product.get('category_id');
    productForm.fields.image_url.value = product.get('image_url')

    // pluck will retrieve one element from each object and put it into an array
    let selectedTags = await product.related('tags').pluck('id');

    // Alternatively:
    // let selectedTags = await product.related('tags').fetchAll().map( t => t.id);

    // Alternivately:
    // let tags = await product.related('tags').fetchAll();
    // let selectedTags = [];
    // for (let t of tags) {
    //     selectedTags.push(t.get('id'));
    // }
    console.log("selectedTags = ", selectedTags);
    productForm.fields.tags.value = selectedTags;

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON(),
        'cloudinaryName': process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryPreset': process.env.CLOUDINARY_UPLOAD_PRESET
    })

})

router.post('/:product_id/update', async (req, res) => {

    // retrieve all the tags
    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    const choices = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });


    // fetch the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        'require': true,
        'withRelated': ['category', 'tags']
    })

    // process the form
    const productForm = createProductForm(choices, allTags);
    productForm.handle(req, {
        'success': async (form) => {
            let {
                tags,
                ...productData
            } = form.data;
            product.set(productData);
            await product.save();

            // // update the tags
            // let selectedTags = tags.split(',');
            // console.log("selected tags after submit form =", selectedTags);

            // // 1. get all the tags that already associated with the product
            // let existingTagIds = await product.related('tags').pluck('id');
            // console.log("existing Tag Ids =" , existingTagIds);

            // // 2. selet all the tags that are not selected anymore and put it into the toRemove array
            // let toRemove = existingTagIds.filter( id => selectedTags.includes(id+"") === false)
            // console.log("to remove=", toRemove);
            // // 3. remove the tags that existed in the relationship but has been removed
            // await product.tags().detach(toRemove);

            // // 4. add in all the tags that are selected in the form
            // await product.tags().attach(selectedTags);

            // alternatively:
            // delete all the existing tags
            let existingTagIds = await product.related('tags').pluck('id');
            product.tags().detach(existingTagIds);

            // add back the selected tags
            let selectedTags = tags.split(',');
            product.tags().attach(selectedTags);

            res.redirect('/products');
        },
        'error': async (form) => {
            // re-render the form if there are errors
            // to display the error messages
            res.render('products/update', {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })
})

router.get('/:product_id/delete', async (req, res) => {
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    })

    res.render('products/delete', {
        'product': product.toJSON()
    })
})

router.post('/:product_id/delete', async (req, res) => {
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