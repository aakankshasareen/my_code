//getbankdetails by id
//getallbankdetails
const connection = require('../../../config/db')
const cm_cfg = require('../../../config/common_config')
const moment = require('moment');
const mysql = require('mysql');
var cm_helper = require('./common_helper');

function created_at() {
    var created = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return created;
}

exports.updateBankDetailsStatus = (req, res) => {
    let bankId = Number(req.body.bankId)
    let status = Number(req.body.status)
    let customerId = Number(req.body.customer_id)

    let remark = req.body.remark
    if ([2, 3].includes(status)) {
        let sql = mysql.format('UPDATE bank_details SET status = ?, updated_at = ?, remark = ? WHERE id = ?', [status, created_at(), remark, bankId])
        connection.query(sql, (err, result) => {
            if (err) {
                res.json({ success: false, message: 'Error', error: cm_cfg.errorFn(err) })
            } else {
                let cu_sql = mysql.format('select email from customer where id=?', [customerId])
                connection.query(cu_sql, (err, curesult) => {
                    if (err) {
                        res.json({ success: false, message: 'Error', error: cm_cfg.errorFn(err) })
                    } else {
                        cm_helper.log(curesult[0].email, 'Update bank details', '', req.body.old_status, status, 'status', '', req.decoded.id, req.decoded.email, bankId, remark).then(function(result) {

                            res.json({ success: true, message: 'Bank details status has been updated' })
                        }).catch(function(err) {
                            res.json({ "success": false, "message": "error", error });
                        })
                    }
                })
            }

        })
    } else {
        res.json({ success: false, message: 'Error', error: "Please send correct parameters" })
    }
}

exports.getBankDetailsByCustomerId = (req, res) => {
    let customerId = req.params.id
    if (!customerId) {
        res.json({ success: false, message: 'customer id not sent' })
    } else {
        connection.query(`SELECT bd.id, bd.user_id, bd.bank_name as bankName, bd.holder_name as holderName, bd.account_number as accountNumber, bd.ifsc_code as ifscCode, bd.bank_branch as bankBranch, bd.account_type as accountType, IFNULL(bd.status,0) as status, bd.remark, c.fullname as fullName FROM (bank_details bd JOIN user u ON u.id = bd.user_id) RIGHT JOIN customer c ON c.id = u.type_id WHERE c.id = ${mysql.escape(customerId)}`,
            (err, bankDetails) => {
                if (err)
                    res.json({ success: false, message: 'Error', error: cm_cfg.errorFn(err) })
                else if (!bankDetails.length)
                    res.json({ success: false, message: 'Bank id not found' })
                else {
                    bankDetails = bankDetails[0]
                    connection.query(`select concat('uploads/${customerId}/banks_documents/',document_name) as document_name from bank_documents_details where bank_id = ${mysql.escape(bankDetails.id)}`,
                        (err, bankDocuments) => {
                            if (err) {
                                res.json({ success: false, message: 'Error', error: cm_cfg.errorFn(err) })
                            } else {
                                if (bankDocuments.length) {
                                    bankDetails.documents = []
                                    bankDocuments.forEach((document) => {
                                        bankDetails.documents.push(document.document_name)
                                    })
                                }
                                res.json({ success: true, message: 'bank details by id', data: bankDetails })
                            }
                        })
                }
            })
    }
}