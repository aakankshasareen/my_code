var express = require('express');
var app = express();
var connection = require('./config/db');
var config = require('./config/config');
var account = require('./config/account');
var helmet = require('helmet');
var fs = require("fs");
var csrf = require('csurf');
var cookieParser = require('cookie-parser')
var session = require('express-session');
const PORT = config.serveport;
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var server = require('http').Server(app);
var io = require('./socket').initialize(server);
var url = require("url");
var symbolsDatabase = require("./Routes/controller/customer/trading_view/symbols_database");
var RequestProcessor = require("./Routes/controller/customer/trading_view/request-processor").RequestProcessor;
var router = express();
const morgan = require('morgan');
//var mongo=require('mongodb');
var mongoose = require('mongoose');


// XSS Security
app.use(cookieParser('Varshney', { httpOnly: true }));

app.use(session({
    name: 'sessionID',
    secret: 'Chinkush',
    cookie: {
        path: '/',
        httpOnly: true,
        secure: true,
        maxAge: 3600000
    },
    rolling: true,
    resave: false,
    saveUninitialized: true
}));

//app.use(csrf({cookie: true}));

//CSRF Security error handler
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') {
        return next(err)
    } else {

        res.status(403).send({ status: -2, message: 'Unauthorized' });
        res.end();
    }
})


app.use(helmet());
app.use(expressValidator());

app.set('view engine', 'ejs');
//app.use(morgan('dev'));
var routes = require('./Routes/routes');
var adminRoutes = require('./Routes/admin-routes');
var customerRoutes = require('./Routes/customer-routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', routes);
app.use('/api', customerRoutes);
app.use('/api', adminRoutes);

app.use(express.static(__dirname + '/frontend/public'));

/*app.use(function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
});*/

var requestProcessor = new RequestProcessor(symbolsDatabase);

app.get('/datafeed*', function (request, response) {
    var uri = url.parse(request.url, true);    
    // console.log(uri);
        var action = uri.pathname;
        var action= action.replace('/datafeed','/');      
		return requestProcessor.processRequest(action, uri.query, response);
})
app.get('*', function (req, res) {

    var token = req.query.token
    var match = req.url.match(/^\/admin\/.+/);
    //console.log(match);
    if (req.url == '/admin/' || req.url == '/admin' || match != null || req.url == '/adminforgotpass' || unescape(req.url) == '/adminforgotpasslink?token=' + token) {
        //console.log('admin');
        res.sendFile(__dirname + '/frontend/public/admin.html');
    } else {
        //console.log('user');
        res.sendFile(__dirname + '/frontend/public/index.html');
    }

});

mongoose.connect('mongodb://'+config.mongodb_host+':'+config.mongodb_port+'/'+config.mongodb_database+'',{ useNewUrlParser: true })
  .then(() => {
    console.log("mongodb connected")
    
  })
  .catch((err) => {
    console.log('Error on start: ' + err.stack);
    process.exit(1);
  });


// Sequelize

//Models
var models = require("./Routes/models");




//Sync Database
// models.sequelize.sync({force:false}).then(function() {

//     console.log('Nice! Database looks fine')


// }).catch(function(err) {

//     console.log(err, "Something went wrong with the Database Update!")

// });


server.listen(PORT, function (err) {
    if (err) {
        console.log(err);
    } else {

        console.log('Server started at : ' + PORT);
        fs.mkdir("key", function (err) {
            console.log("make")
        })
        account.eth();
account.erc20('FULX');
account.erc20('ABC');

    }
});

