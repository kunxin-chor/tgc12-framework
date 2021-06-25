const bookshelf = require('../bookshelf')

// create a new model named Product ( first argument of the model function)
// and map it to the products table in the databse
const Product = bookshelf.model('Product', {
    'tableName': 'products' // <-- refers to the products table in the database 
})

module.exports = { Product };