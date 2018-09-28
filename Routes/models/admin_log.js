var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var adminLogSchema = new Schema({

  email:{type:String},
  operation: { type: String, required: true},
  suboperation: { type: String },
  old_value: {type:String},
  new_value: {type:String},
  col_name: { type: String},
  currency_code:String,
  created_at: Date,
  updated_by: {type:Number,required: true},
  updated_by_email:{type:String,required: true},
  table_id:Number,
  comment:String,
});

// the schema is useless so far
// we need to create a model using it
var adminLog = mongoose.model('adminlog', adminLogSchema);

// make this available to our users in our Node applications
module.exports = adminLog;