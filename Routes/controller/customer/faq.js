var request = require('request')
var mysql = require('mysql');
var connection = require('../../../config/db');
var config = require('../../../config/config');
var path = require('path')
var multer = require('multer')
var fs = require('file-system');
var bcrypt = require('bcryptjs');
var nodemailer = require('nodemailer');
var salt = bcrypt.genSaltSync(10);
var moment = require('moment');
var async = require('async');
var email_helper = require('../../../config/email_helper');

var date = new Date();
created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");



exports.getAllfaqCat = function (req, res) {
    //let sql = mysql.format("SELECT fq.question, fq.answer, fqc.category_name FROM faq fq JOIN faq_category fqc on fqc.id=fq.category_id where fq.status=1 order by fq.id DESC");
    //console.log(sql);
    let sql = mysql.format("SELECT * FROM faq_category  where status=1 order by id ASC");
    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "Faq not found" })
        } else {
            res.json({ success: true, message: "Faq Details", dataCat: data })
        }
    })
}

// SELECT fq.*, fc.* FROM `faq` as fq join faq_category as fc on fq.category_id = fc.id
// SELECT fq.question, fq.answer, fc.* FROM `faq` as fq RIGHT join faq_category as fc on fq.category_id = fc.id AND fq.status=1

exports.getAllfaqList = function (req, res) {

    let sql = mysql.format("SELECT fq.question, fq.answer, fqc.category_name FROM faq fq JOIN faq_category fqc on fqc.id=fq.category_id where fq.status=1 AND fq.category_id=1 order by fq.id DESC");

    connection.query(sql, function (error, data) {

        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "Faq not found" })
        } else {
            res.json({ success: true, message: "Faq Details", data: data })
        }
    })
}


exports.getAllfaqListByCat = function (req, res) {
    let concat = ``;
    if (req.query.category) {
        concat = ` where fq.category_id = ` + mysql.escape(req.query.category) + ``;
    }
    let sql = mysql.format(`SELECT fq.question, fq.answer, fc.* FROM faq as fq 
        RIGHT JOIN faq_category as fc on fq.category_id = fc.id AND fq.status=1 `+ concat + ` order by fc.id asc`);

    connection.query(sql, function (error, data) {

        if (error) {
            res.json({ success: false, message: "error", error })
        } else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "Faq not found" })
        } else {
            console.log(data)
            let a = data;
            let b = [];
            var i = 0;
            var j = 0;
            let list = {};
            let prev = null;
            let listFunc = (e) => {
                list = {
                    question: e.question,
                    answer: e.answer
                }
                b[j].list.push(list);
            }
            data.forEach((e) => {
                if (prev && prev == e.id) {
                    listFunc(e);
                }
                else {
                    if (i == 0) {
                        b[j] = e;
                        b[j].list = [];
                        listFunc(e);
                        delete b[j].question;
                        delete b[j].answer;
                        prev = e.id;
                    }
                    else {
                        j++;
                        b[j] = e;
                        b[j].list = [];
                        listFunc(e);
                        delete b[j].question;
                        delete b[j].answer;
                        prev = e.id;
                    }
                }
                i++;
            })
            res.json({ success: true, message: "Faq Details", data: b })
        }
    })
}



exports.getAllfaqByCat = function (req, res) {
    //let sql = mysql.format("SELECT fq.question, fq.answer, fqc.category_name FROM faq fq JOIN faq_category fqc on fqc.id=fq.category_id where fq.status=1 order by fq.id DESC");
    //console.log(sql);
    let id = req.body.id
    let sql = mysql.format("SELECT * FROM faq  where category_id=? && status=1 order by id DESC", [id]);

    connection.query(sql, function (error, data) {
        if (error) {
            res.json({ success: false, message: "error", error })
        } /*else if (data[0] == null || data[0] == undefined) {
            res.json({ success: false, message: "Faq not found" })
        } */else {

            res.json({ success: true, message: "Faq Details", data: data })

        }
    })
}

exports.call_download = (req, res) => {


    let path_1 = "./docs/a Online Trading Agreement en_040818.pdf",
        path_2 = "./docs/a Online Trading Agreement en_040818.pdf",
        path_3 = './docs/a Privacy Doc en_04082018.pdf',
        path_4 = './docs/a Token Purchase Sale terms en_040818.pdf',
        path_5 = './docs/a Token Purchase Sale terms en_040818.pdf',
        path_6 = './supportdoc/docs-temp/Rates Fees 280718.pdf',
        path_7 = './supportdoc/docs-temp/Bounty Programm en_310718.pdf',
        path_8 = './supportdoc/docs-temp/Fund Deposit & Withdrawal.pdf',
        // path_9 = './supportdoc/docs-temp/KYC.pdf',
        path_9 = './docs/KYC.docx',
        path_10 = './docs/Strategic partnerships.pdf',

        selector = false;
        console.log("called", path.resolve(path_1));
        if(req.query.doc == 1){
            selector = path_1;
        }
        if(req.query.doc == 2){
            selector = path_2;
        }
        if(req.query.doc == 3){
            selector = path_3;
        }
        if(req.query.doc == 4){
            selector = path_4;
        }
        if(req.query.doc == 5){
            selector = path_5;
        }
        if(req.query.doc == 6){
            selector = path_6;
        }
        if(req.query.doc == 7){
            selector = path_7;
        }
        if(req.query.doc == 8){
            selector = path_8;
        }
        if(req.query.doc == 9){
            selector = path_9;
        }
        if(req.query.doc == 10){
            selector = path_10;
        }
        if(selector){
            res.download(selector);
        }
}

