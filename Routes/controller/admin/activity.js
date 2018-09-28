var mongoose = require('mongoose');
var adminlog = require('../../models/admin_log');
var moment = require('moment');


exports.adminUserActivity = function(req, res) {

    var q = {}; 
  if(typeof req.body.updated_by_email !== '' && req.body.updated_by_email){ 
    q['$and']=[];
    q["$and"].push({ updated_by_email: {$regex: req.body.updated_by_email.split(",") }}); 
  }
  if(typeof req.body.email !== '' && req.body.email){
  q['$and']=[];
 
    q["$and"].push({ email: {$regex: req.body.email.split(",") }});
  }
 
console.log("query exe", q)
    //console.log("call in api")
   var query = {}
    var limit = req.body.limit;
    var skip = req.body.offset == null ? 0 : req.body.offset;

    query.skip = skip;
    query.limit = limit;

    adminlog.count(function(err, usersCount) {
        if (err) {
            res.json({ success: false, message: "Error", err })
        } else {
            adminlog.find(q,{}, query, function(err, users) {
                if (err) {
                    res.json({ success: false, message: "Error", err })
                } else {
                  var finaldata=users.map(function(data,index){
                    return {
                      "id":index+1,
                      "email":data.email,
                      "operation":data.operation,
                      "old_value":data.old_value,
                      "new_value":data.new_value,
                      "updated_by_email":data.updated_by_email,
                      "currency_code":data.currency_code,
                      "comment":data.comment,
                      "column_name":data.col_name
                    }
                  })               
                    res.json({ sucess: true, message: "user activity log", data: finaldata, count: usersCount })
                }
            }).sort({_id:-1})
        }
    })
}

