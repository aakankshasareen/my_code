var config = require('../../../config/config');
var connection = require('../../../config/db');
var moment = require('moment');
var date = new Date();
var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");
var Model = require('../../../config/bookshelf-model');




exports.getAllPermission = function (req, res) {

    var role_id = req.body.id;
    
    var PermissionRole = new Model.PermissionRole();
    
    // get permissions of role
    PermissionRole.where({role_id:role_id}).fetchAll().then(function(saved_permissions) {
        var permission_has = [];
        saved_permissions.toJSON().forEach(function(saved_permission) {
            permission_has.push(saved_permission.permission_id)            
        });
        
        // get permissions with childrens
        PermissionPromise = new Model.Permission().where({parent_permission_id: 0 }).fetchAll({withRelated: ['children', 'children.children', 'children.children.children', 'children.children.children.children']});
        PermissionPromise.then(function(permissions) {

            if(permissions==null) {
                res.json({"success": false, "message": "no permission found"});
            }else {
                var retresult = {};
                retresult['permissions'] = permissions;
                retresult['permission_has'] = permission_has;
                
                // fetch all permissions id in flat array
                AllPermissionPromise = new Model.Permission().fetchAll({columns: ['id']});
                AllPermissionPromise.then(function(allpermissions) {
                    if(allpermissions==null) {
                        res.json({"success": false, "message": "no permission found"});
                    }else {
                        var all_permissions = [];
                        allpermissions.toJSON().forEach(function(item_permission) {
                            all_permissions.push(item_permission.id)            
                        });
                        retresult['allpermissions'] = all_permissions;
                        res.json({"success": true, "message": "permissions listed", 'records':retresult});
                    }
                }).catch(function(err) {
                    res.json({"success": false, "message": "Could not find any permissions"});
                });
                
            }
        }).catch(function(err) {
            res.json({"success": false, "message": "Could not find any permissions"});
        });	
        
    }).catch(function(err) {        
        res.json({"success": false, "message": "Could not find any permissions"});
    });
 
}

exports.addRolePermission = function (req, res) {
    var permissions = [];
    permissions = req.body.permissions;    
    if(permissions==null || permissions.length==0) {
        res.json({"success": false, "message": "No Permission to update"});
    }
    var insert_arr = [];
    var role_id = req.body.role_id;
    permissions.forEach(function(permission_id) {
        var temp_arr = {};
        temp_arr['permission_id'] = permission_id;
        temp_arr['role_id'] = role_id;
        insert_arr.push(temp_arr);
    });
    
    var jsonString = JSON.stringify(insert_arr);
    var test = [{'permission_id': 1, 'role_id': 5 },{'permission_id': 10, 'role_id': 50 }];
    
    var accounts = Model.PermissionRoles.forge(insert_arr);
    var PermissionRole = new Model.PermissionRole();
    
    PermissionRole.where({role_id:role_id}).destroy().then(function() {
        accounts.invokeThen('save').then(function() {
            res.json({"success": true, "message": "Permissions updated"});      
        }).catch(function(err) {            
            res.json({"success": false, "message": "Could not find any permissions"});
        });
        
    }).catch(function(err) {        
        res.json({"success": false, "message": "Could not find any permissions"});
    });
 
}


exports.getAdminUserPermission = function (req, res) {

    var role_id = req.body.role_id;    
    var PermissionRole = new Model.PermissionRole();
        
    // get permissions of role
    PermissionRole.where({role_id:role_id}).fetchAll({withRelated: ['permissions']}).then(function(saved_permissions) {
        var permission_has = {};
        
        saved_permissions.toJSON().forEach(function(saved_permission) {            
            permission_has[saved_permission.permissions.name] = 1;            
        });        
        res.json({"success": true, "message": "permissions listed", 'allowed_permissions':permission_has});
        
    }).catch(function(err) {        
        console.log(err);
        res.json({"success": false, "message": "Could not find any permissions"});
    });
 
}