var BDB = require('./bookshelf').BDB;

var User = BDB.Model.extend({
   tableName: 'permissions',
    role: function() {
        return this.hasMany(Permission, 'parent_permission_id');
    }   
});


var Permission = BDB.Model.extend({
   tableName: 'permissions',
   children: function() {
    return this.hasMany(Permission, 'parent_permission_id');
   }   
});

var PermissionRole = BDB.Model.extend({
   tableName: 'permission_role',
    permissions: function() {
        return this.hasOne(Permission, 'id', 'permission_id');
    }    
});

var User = BDB.Model.extend({
   tableName: 'user'    
});

var Customer = BDB.Model.extend({
   tableName: 'customer',
    user: function() {
        return this.hasOne(User, 'type_id', 'id');
    }    
});

var PermissionRoles = BDB.Collection.extend({
  model: PermissionRole
});

module.exports = {
   Permission: Permission,
   PermissionRole: PermissionRole,
   PermissionRoles : PermissionRoles,
   Customer : Customer,
   User : User,
};