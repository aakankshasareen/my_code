var config = require('../../../config/config');
var connection = require('../../../config/db');
var moment = require('moment');
var date = new Date();
var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");


exports.getAllRoleList = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var filter_value = req.body.filter_value;
    var name = req.body.name;
    var sortname = req.body.sortname;
    var phonecode = req.body.phonecode;
    var status = req.body.status;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var searchQuery = '';
    var orderBy = '';

    if (typeof name !== 'undefined' && name) {
        searchQuery += " AND rl.name LIKE '%" + name + "%' ";
    }
    if (typeof sortname !== '' && sortname) {
        searchQuery += " AND rl.sortname LIKE '%" + sortname + "%' ";
    }
    if (typeof phonecode !== 'undefined' && phonecode) {
        searchQuery += " AND rl.phonecode LIKE '%" + phonecode + "%' ";
    }
    if (typeof status !== 'undefined' && status) {
        searchQuery += " AND rl.status = " + status;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY rl.id DESC";
    }


    var query = connection.query("SELECT SQL_CALC_FOUND_ROWS rl.*, @count:=@count+1 AS serial_number FROM roles rl , (SELECT @count:="+offset+") AS X WHERE rl.is_active != 2 " + searchQuery + "  LIMIT " + offset + ", " + limit, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            connection.query('SELECT FOUND_ROWS() as count', function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};                
                res.json({"success": true, "message": "Country List", result});
            });
        }
    })
}


exports.addRole = function (req, res) {    
    var insertData = {
        "name": req.body.roles_name,
        "description": req.body.roles_description,
        "created_at": created_at,
        "is_active": req.body.is_active,         
    }        
    connection.query("INSERT INTO roles SET ?", insertData, function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Role Added Successfully"});
        }
    });
}

exports.updateRole = function (req, res) {    
    var param_id = req.params.id;
    
    var updateData = {
        "name": req.body.roles_name,
        "description": req.body.roles_description,
        "created_at": created_at,
        "is_active": req.body.is_active,         
    }     
    
    connection.query("UPDATE roles SET ? WHERE id = ? AND is_active!=2", [updateData, param_id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else  {
            res.json({"success": true, "message": "Role Updated Successfully"});
        } 
    });
}

exports.editRole = function (req, res) {
    var param_id = req.params.id;
    var query = connection.query("SELECT * FROM roles WHERE id =" + param_id, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Edit Role", data});
        }
    });
};


exports.deleteRole= function (req, res) {
    var id = req.params.id;
    var updateData = {
        "is_active": "2",
        "updated_at": created_at,
        "updated_by": req.decoded.id
    };
    var query = connection.query("UPDATE roles SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Role Deleted Successfully", result});
        }
    });
};

exports.getRoleList = function (req, res) {

 
    var query = connection.query("SELECT id, name FROM roles where roles.is_active = 1 ", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Country List", data});        
        }
    })
}