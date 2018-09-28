const connection = require('../../../config/db');
const cm_cfg = require('../../../config/common_config')
var mysql = require('mysql');

exports.userAddressByEmail = function(req, res) {
    let sql = "SELECT crypto_address,crypto_type FROM user_crypto_address join user on user.id = user_crypto_address.user_id where user.email ='" + req.body.email + "'";
    connection.query(sql, function(error, data) {
        if (error) {
            res.json({ success: false, message: "error", error:error })
        } else if (data[0] == null || data[0] == undefined) {

            res.json({ success: false, message: "User not found" })
        } else {
            res.json({ success: true, message: "User found", data: data })
        }
    })
}