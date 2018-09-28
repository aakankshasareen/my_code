var config = require('../../../config/config');
var connection = require('../../../config/db');
var moment = require('moment');
var date = new Date();
var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");

exports.getTotalUsers = function (req, res) {    
    var query = connection.query("SELECT count(*) as count  FROM user u LEFT JOIN customer cu ON u.type_id = cu.id  WHERE u.user_type = 'C' AND cu.status !=2", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Total Users", data});
        }
    });
}

exports.getTotalCustomerByKycStatus = function (req, res) {

    var kyc_status = req.body.kyc_status;
    var query = connection.query("SELECT count(*) AS total_count FROM user u JOIN customer c ON u.type_id = c.id  WHERE u.user_type = 'C' AND c.kyc_status= " + kyc_status, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Total Pending KYC for approval", data});
        }
    });
}

exports.getTotalActiveCurrencies = function (req, res) {
    var query = connection.query("SELECT count(*) AS total_currencies FROM currency_master WHERE status='1'", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Total Active Currencies", data});
        }
    });
}

exports.getActiveCurrencyIcons = function (req, res) {
    var query = connection.query("SELECT currency_code , currency_name, CONCAT('images/currencyimage/','',currency_icon) as currency_icon_path FROM currency_master WHERE status='1' AND currency_icon is NOT NULL", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Active Currency Icons", data});
        }
    });
}
exports.getNewCustomers = function (req, res) {
    var query = connection.query("SELECT cu.fullname, u.email, cu.mobileNumber, cu.address, countries.name as country, u.lastLogin_timestamp as lastLogin, cu.created_at as registered FROM user u LEFT JOIN customer cu ON u.type_id = cu.id LEFT JOIN countries ON countries.id = cu.country_code WHERE u.user_type = 'C' AND  cu.status != '2' ORDER BY u.id DESC LIMIT 0,10", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "New Customers", data});
        }
    });
}

exports.getAllNotification = function (req, res) {
    var query = connection.query("SELECT * FROM admin_notifications order by id desc limit 100", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            var query = connection.query("SELECT notification_count FROM admin where user_id =1", function (error, count) {
            if (error) {
                res.json({"success": false, "message": "error", error});
            } else {
                //data.push({notify_data:}) ;

                res.json({"success": true, "message": "Notifications", data, "notify_data": count[0].notification_count});
            }
            });
            
        }
    });
}


exports.getAllNotificationList = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var name = req.body.name;
    var title = req.body.title;    
    var is_read = req.body.is_read;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var order_column_alias = req.body.order_column_alias == null ? '' : req.body.order_column_alias;
    var searchQuery = '';

    if (typeof title !== 'undefined' && title) {
        searchQuery += " AND cy.title LIKE '%" + title + "%' ";
    }
    
    if (typeof is_read !== 'undefined' && is_read !== null) {
        searchQuery += " AND cy.is_read = " + is_read;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column_alias + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY cy.id DESC";
    }

//    if (filter_value != '') {
//        searchQuery = " AND (cy.name LIKE '%" + filter_value + "%' )";
//    }
    var query = connection.query("SELECT cy.id, title, cy.customer_id, cy.is_read, link, customer.email, customer.fullname, @count:=@count+1 AS serial_number FROM admin_notifications cy join customer on customer.id = cy.customer_id, (SELECT @count:="+offset+") AS X " + searchQuery + "  LIMIT " + offset + ", " + limit, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
//            console.log(query.sql);
            connection.query("SELECT count(*) as count FROM admin_notifications cy  " + searchQuery, function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "Notification List", result});
            });
        }
    })
}


exports.resetAdminNotification = function (req, res) {
    var query = connection.query("update admin set notification_count = 0 where user_id = 1", function (error, data) {
    if (error) {
        res.json({"success": false, "message": "error", error});
    } else {            
            res.json({"success": true, "message": "Reset Success" });
        }    
    });
}

exports.markNotificationRead = function (req, res) {
    var notify_id = req.body.notify_id;
    var query = connection.query("update admin_notifications set is_read = 1 where id = ?", [notify_id], function (error, data) {
    if (error) {
        res.json({"success": false, "message": "error", error});
    } else {            
            res.json({"success": true, "message": "Reset Success" });
        }    
    });
}

const io = require('../../../socket.js').io()

exports.getLiveUsers = (req, res)=>{
  res.json({success: true, liveUsers: io.totalLiveUsers?io.totalLiveUsers:0})
}
