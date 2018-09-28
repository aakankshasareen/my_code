var connection = require('../../../config/db')

exports.addSmsTemplate = (req, res)=>{
  let template_code = req.body.template_code
  let template_name = req.body.template_name
  let template_message = req.body.template_message
  let status = Number(req.body.status)
  if(!(template_code && [0,1].includes(status) && template_name && template_message))
    res.json({success: false, message: 'Please send proper parameters'})
  else{
    connection.query('SELECT id FROM sms_template where template_code = ?', [template_code], (err, result)=>{
      if(err)
        res.json({success: false, message: 'Error', err})
      else if(result.length)
        res.json({success: false, message: 'Template Code Exists'})
      else {
        connection.query('INSERT INTO sms_template(template_name, template_code, template_message, status) values(?, ?, ?, ?)',[template_name, template_code, template_message, status], (err, result)=>{
          if(err)
            res.json({success: false, message: 'Error', err})
          else
            res.json({success: true, message: 'SMS Template Created'})
        })
      }
    })
  }
}

exports.updateSmsTemplate = (req, res) => {
  let id = req.body.id
  let updateData = {
    template_code: req.body.template_code,
    template_name: req.body.template_name,
    template_message: req.body.template_message,
    status: Number(req.body.status)
  }
  if([0,1].includes(updateData.status) && updateData.template_code && updateData.template_name && updateData.template_message){
    connection.query('UPDATE sms_template SET ? where id = ?', [updateData, id], (err, result)=>{
      if(err){
        if(err.code = 'ER_DUP_ENTRY')
          res.json({"success": false, "message": "Template Already Exists"})
        else
          res.json({"success": false, "message": "error", err})
        }
      else
        res.json({success: true, message: 'SMS Template Updated'})
    })

  } else {
    res.json({success: false, message: 'Please send proper prameters'})
  }
}

exports.getSmsTemplateById = (req, res) => {
  let id = req.query.id
  if(!id)
    res.json({success: false, message: 'send template id'})
  else
    connection.query('SELECT * FROM sms_template where id = ? LIMIT 1', [id], (err, result)=>{
      if(err)
        res.json({success: false, message: 'Error', err})
      else if(!result.length)
        res.json({success: false, message: 'SMS template not found'})
      else{
        res.json({success: true, message: 'SMS template', data: result[0]})
      }
    })
}

exports.getSmsTemplateList = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var filter_value = req.body.filter_value;
    var template_name = req.body.template_name;
    var template_code = req.body.template_code;
    var status = req.body.status;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var searchQuery = '';
    var orderBy = '';

    if (template_name) {
        searchQuery += " AND st.template_name LIKE '%" + template_name + "%' ";
    }
    if (template_code) {
        searchQuery += " AND st.template_code LIKE '%" + template_code + "%' ";
    }

    if (status) {
        searchQuery += " AND st.status = " + status;
    }
    if (order_column && order_column && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY st.id DESC";
    }

//    if (filter_value != '') {
//        searchQuery = " AND (cy.name LIKE '%" + filter_value + "%' )";
//    }
    var query = connection.query("SELECT SQL_CALC_FOUND_ROWS st.*, @count:=@count+1 AS serial_number FROM sms_template st , (SELECT @count:="+offset+") AS X WHERE st.status != 2 " + searchQuery + "  LIMIT " + offset + ", " + limit, function (error, data) {
        if (error) {

            res.json({"success": false, "message": "error", error});
        } else {

            connection.query('SELECT FOUND_ROWS() as count', function (error, data1) {

                var result = {'totalRecords': data1, 'records': data};

                res.json({"success": true, "message": "Faq List", result});
            });
        }
    })
};
