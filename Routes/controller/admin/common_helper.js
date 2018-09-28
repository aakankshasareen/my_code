var mongoose = require('mongoose');
var adminlog = require('../../models/admin_log');
var moment = require('moment');

function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}

exports.log=function(email, oper, suoper, oldValue, newValue, colName, currencyCode, up_by,up_by_email,taId,comm) {

    return new Promise(function(resolve, reject) {
    	//console.log(email, oper, suoper, oldValue, newValue, colName, currencyCode, up_by,up_by_email,taId,comm)

        var insertData = adminlog({
           
            "email":email,
            "operation": oper,
            "suboperation": suoper,
            "old_value": oldValue,
            "new_value": newValue,
            "col_name": colName,
            "currency_code": currencyCode,
            "updated_by": up_by,
            "updated_by_email":up_by_email,
            "created_at": created_at(),
            "table_id":taId,
            "comment":comm
        });

        insertData.save(function(err) {
            if (err) {
                console.log(err)
                reject(err)
            } else {
                console.log("successfully save", )
                resolve()
            }

        })
    })
}