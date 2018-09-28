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
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
var base64Img = require('base64-img');
var jwt = require('jsonwebtoken');
var cm_cfg = require('../../../config/common_config');
const jwtBlacklist = require('jwt-blacklist')(jwt);
http = require('http'),
https = require('https');



// donwload sum sub image
function downloadSumSubImage(image) {        
    var Stream = require('stream').Transform;
    var url = image['image_url'];
    var filename = 'frontend/public/sumsub_docs/'+image['image_name'];        
    var client = http;
    if (url.toString().indexOf("https") === 0){
      client = https;
    }
    return new Promise(function(resolve, reject) {
        client.request(url, function(response) {                                        
          var data = new Stream();                                                    

          response.on('data', function(chunk) {                                       
             data.push(chunk);                                                         
          });                                                                         

          response.on('end', function() {  

              fs.writeFile(filename, data.read(), function(err) {
                if(err) {
                    resolve("error");
                }

                resolve("saved");
            }); 

          });                                                                         
       }).end();
    });
}

// get all uploaded images
function getSumSubImages(req, res, sumsubresponse, customer_data) {
    
    var all_images = [];
    var identity_images = sumsubresponse['IDENTITY']['imageIds'];
    var selfie_images = sumsubresponse['SELFIE']['imageIds'];
    var sumsub_api_key = config.sumsub_api_key;
    var sumsub_api_url = config.sumsub_api_url;
    var inspection_id = customer_data['inspection_id'];
    var applicant_id = customer_data['applicant_id'];
    var sumsub_docu_url = sumsub_api_url+"/resources/applicants/"+applicant_id+"/requiredIdDocsStatus?key="+sumsub_api_key;
    
    // create array of identity type images
    async.forEachOf(identity_images, function (elem, key, callback) {    
        var img_status = 0;
        if(sumsubresponse['IDENTITY']['reviewResult']['reviewAnswer'] == 'GREEN') {
            img_status = 1;
        }
        var elem_arr = {
            'customer_id':customer_id,
            'image_type' : 'IDENTITY',
            'image_status' : img_status,
            'id_doc_type' : sumsubresponse['IDENTITY']['idDocType'],
            'image_id' : elem,            
            'image_url' : sumsub_api_url+"/resources/inspections/"+inspection_id+"/resources/"+elem+"?key="+sumsub_api_key,
            'image_name' : applicant_id+"_"+elem+".jpg",
        }
        all_images.push(elem_arr);        
    }, function (err) {
        if (err) {
            console.error(err.message);
            //return res.json({success: false, message: err});
        }        
    });
    
    // create array of selfie type images
    async.forEachOf(selfie_images, function (elem, key, callback) {
        var img_status = 0;
        if(sumsubresponse['SELFIE']['reviewResult']['reviewAnswer'] == 'GREEN') {
            img_status = 1;
        }
        var elem_arr = {
            'customer_id':customer_id,
            'image_type' : 'SELFIE',
            'image_status' : img_status,
            'id_doc_type' : sumsubresponse['SELFIE']['idDocType'],
            'image_id' : elem,            
            'image_url' : sumsub_api_url+"/resources/inspections/"+inspection_id+"/resources/"+elem+"?key="+sumsub_api_key,
            'image_name' : applicant_id+"_"+elem+".jpg",
        }
        all_images.push(elem_arr);        
    }, function (err) {
        if (err) {
            console.error(err.message);
            //return res.json({success: false, message: err});
        }        
    });
    
    // download each image and save it to database
    async.forEachOfSeries(all_images, function (elem, key, callback) {        
        downloadSumSubImage(elem).then((result)=>{
            
            saveSumSubDocs(req, res, elem).then(function(response) {
                setTimeout(()=>callback(null), 200);
            }).catch((err)=>{
                callback(error);
            });
            
         }).catch((err)=>{
             console.log(err);
             callback(err)
        });
    }, function (err) {
        if (err) {
            console.error(err.message);
            //return res.json({success: false, message: err});
        }
        //return res.json({success: true, message: "downloaded"});
    });
   
}

/**
 *  save sumsub image details to database
 */
function saveSumSubDocs(req, res, imagedata) {
    var image_id = imagedata['image_id'];
    var customer_id = imagedata['customer_id'];
    return new Promise(function(resolve, reject) {
        var exist_image_sql = mysql.format("SELECT * from sumsub_documents where customer_id = ? AND image_id = ? limit 1", [customer_id, image_id]);
        
        connection.query(exist_image_sql, function(error, data) {            
            if (error) {
                res.json({ success: false, message: "error", error });
                reject("not saved error");
            } else if(data.length > 0) {
                var doc_id = data[0]['id'];
                var update_sql = mysql.format("UPDATE sumsub_documents SET ? WHERE id = ?", [imagedata, doc_id]);
                
                connection.query(update_sql, function(error, result) {
                    if (error) {
                        resolve("not updated");
                    } else {                
                        resolve("updated");
                    }
                });
                
            }else {
                
                var sql1 = mysql.format("INSERT INTO sumsub_documents SET ?", imagedata);                
                connection.query(sql1, function(error, dta) {
                    if (error) {
                       resolve("not saved");
                    } else {
                       resolve("saved");
                    }
                });
            }
        });
        
    
    });
};


// 
exports.getSumSubDocuments = function(req, res, email) {
   
    let sql = mysql.format("SELECT * FROM customer WHERE email =?", [email]);
    connection.query(sql, function(error, data) {
        if(error) {
            
        }else if(data[0] != null && data[0] != undefined && data[0]['applicant_id']!=null) {
            
            var applicant_id = data[0]['applicant_id'];
            var inspection_id = data[0]['inspection_id'];
            var customer_id = data[0]['id'];
            var customer_data = data[0];
            
            //var applicant_id = '5ae9b2b50a975a2b162904cc';
            var sumsub_api_key = config.sumsub_api_key;
            var sumsub_api_url = config.sumsub_api_url;
            var sumsub_docu_url = sumsub_api_url+"/resources/applicants/"+applicant_id+"/requiredIdDocsStatus?key="+sumsub_api_key;
            console.log(sumsub_docu_url);
             var request = require('request');
             // Set the headers
             var headers = {
                 'Content-Type': 'application/json',
                 'Accept': 'application/json',
                 'charset': 'UTF-8'
             }

             // Configure the request
             var options = {
                 url: sumsub_docu_url,
                 method: 'GET',
                 headers: headers,
                 json: true,
                 body: {}
             };   

             // Start the request
             request(options, function(error, response) {

                 if (!error) {
                     if (response.body!= undefined) {
                         
                         // if successfully got the document list                
                         getSumSubImages(req, res, response.body, customer_data);
                     } else if (response.body == undefined) {
                         console.log("error happened");
                     }
                 } else {
                     console.log(error);
                 }
             });
        }else {
            console.log("could not found enough details");
        }
    });
        
}
