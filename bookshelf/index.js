const setupKnex = require('knex');
const knex = setupKnex({
    client: 'mysql',
    connection: {
        user: 'foo',
        password: 'bar',
        database: 'organic'
    }
})

const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;
