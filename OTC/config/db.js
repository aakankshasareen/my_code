var mysql = require('mysql');
var config = require('./config');
var db;

function connectDatabase() {
    if (!db) {
        db = mysql.createConnection({
            host:config.mysql_host,
            user: config.mysql_user,
            password: config.mysql_password,
            database: config.mysql_database,
            connectTimeout: 30000            
        });
        
        db.connect(function(err){
            if(!err) {
                console.log('Database is connected!');
            } else {
                console.log('Error connecting database!');
                throw err;
            }
        });
    }
    return db;
}

module.exports = connectDatabase();