var config = require('./config');
var knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : config.mysql_host,
        user     : config.mysql_user,
        password : config.mysql_password,
        database : config.mysql_database,
        charset: 'utf8'
    }
    });

    var Bookshelf = require('bookshelf')(knex);

    module.exports.BDB = Bookshelf;
