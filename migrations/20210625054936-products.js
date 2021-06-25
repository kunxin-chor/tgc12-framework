'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  /*
  create table product (
    id int auto_increment primary key,
    name varchar(100) not null,
    cost int,
    description text
  ) engine=innodb;
  */
  return db.createTable('products', {
    'id': {
      'type': 'int',
      'primaryKey': true,
      'autoIncrement': true
    },
    'name':{
      'type':'string',
      'length': 100,
      'notNull': true
    },
    'cost':{
      'type':'int',
      'notNull':true
    },
    'description':{
      'type': 'int',
      'notNull': true
    }
  })
};

exports.down = function (db) {
  return db.dropTable('products');
};

exports._meta = {
  "version": 1
};