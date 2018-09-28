var config = require('../../../config/config');
var connection = require('../../../config/db');
var moment = require('moment');
var date = new Date();
var created_at = moment(date).format("YYYY-MM-DD HH:mm:ss");


exports.getCountries = function (req, res) {
    var query = connection.query("SELECT id, name, status FROM countries WHERE status = 1 ORDER BY name ASC", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Countries List", data});
        }
    });
}

exports.getStates = function (req, res) {
    var query = connection.query("SELECT id, name, status  FROM states WHERE status = 1", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "States List", data});
        }
    });
}


exports.getStatesByCountryId = function (req, res) {
    var country_id = req.params.country_id;
    var query = connection.query("SELECT * FROM states WHERE country_id=" + country_id + " ORDER BY name ASC", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "States List", data});
        }
    });
}

exports.getCitiesByStateId = function (req, res) {
    var state_id = req.params.state_id;
    var query = connection.query("SELECT * FROM cities WHERE state_id=" + state_id + " ORDER BY name ASC", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Cities List By State Id", data});
        }
    });
}

exports.getCitiesByCountryId = function (req, res) {
    var country_id = req.params.country_id;
    var query = connection.query("SELECT * FROM cities WHERE country_id=" + country_id + " ORDER BY name ASC", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
//            console.log(query.sql)
            res.json({"success": true, "message": "Cities List By Country Id", data});
        }
    });
}



exports.getAllCountryList = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var name = req.body.name;
    var sortname = req.body.sortname;
    var phonecode = req.body.phonecode;
    var status = req.body.status;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var order_column_alias = req.body.order_column_alias == null ? '' : req.body.order_column_alias;
    var searchQuery = '';

    if (typeof name !== 'undefined' && name) {
        searchQuery += " AND cy.name LIKE '%" + name + "%' ";
    }
    if (typeof sortname !== '' && sortname) {
        searchQuery += " AND cy.sortname LIKE '%" + sortname + "%' ";
    }
    if (typeof phonecode !== 'undefined' && phonecode) {
        searchQuery += " AND cy.phonecode LIKE '%" + phonecode + "%' ";
    }
    if (typeof status !== 'undefined' && status !== null) {
        searchQuery += " AND cy.status = " + status;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column_alias + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY cy.id DESC";
    }

//    if (filter_value != '') {
//        searchQuery = " AND (cy.name LIKE '%" + filter_value + "%' )";
//    }
    var query = connection.query("SELECT cy.*, @count:=@count+1 AS serial_number FROM countries cy , (SELECT @count:="+offset+") AS X WHERE cy.status != 2 " + searchQuery + "  LIMIT " + offset + ", " + limit, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
//            console.log(query.sql);
            connection.query("SELECT count(*) as count FROM countries cy WHERE cy.status != 2 " + searchQuery, function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "Country List", result});
            });
        }
    })
}



exports.addCountry = function (req, res) {

    connection.query("SELECT*FROM countries where name='" + req.body.country_name + "'", function (error, countryresult) {
        if (countryresult[0] != null || countryresult[0] != undefined) {
            res.json({success: false, message: "Country found"})
        } else {
            connection.query("SELECT*FROM countries where sortname='" + req.body.country_sortname + "'", function (error, sortnameresult) {
                if (sortnameresult[0] != null || sortnameresult[0] != undefined) {
                    res.json({success: false, message: "Sortname found"})
                } else {
                    connection.query("SELECT*FROM countries where phonecode='" + req.body.country_phonecode + "'", function (error, phonecoderesult) {
                        if (phonecoderesult[0] != null || phonecoderesult[0] != undefined) {
                            res.json({success: false, message: "Phonecode found"})
                        } else {

                            var insertData = {
                                "name": req.body.country_name,
                                "sortname": req.body.country_sortname,
                                "phonecode": req.body.country_phonecode,
                                "created_at": created_at,
                                "status": req.body.status,
                                "created_by": req.decoded.id
                            }

                            connection.query("INSERT INTO countries SET ?", insertData, function (error, result) {
                                if (error) {
                                    res.json({"success": false, "message": "error", error});
                                } else {
                                    res.json({"success": true, "message": "Country Added Successfully"});
                                }
                            });
                        }
                        ;
                    })
                }
            })
        }
    })
}


exports.updateCountry = function (req, res) {
    var param_id = req.params.id;

    connection.query("SELECT * FROM countries where name='" + req.body.country_name + "' AND id !=" + param_id, function (error, countryresult) {
        if (countryresult[0] != null || countryresult[0] != undefined) {
            res.json({success: false, message: "Country found"})
        } else {
            connection.query("SELECT*FROM countries where sortname='" + req.body.country_sortname + "' AND id !=" + param_id, function (error, sortnameresult) {
                if (sortnameresult[0] != null || sortnameresult[0] != undefined) {
                    res.json({success: false, message: "Sortname found"})
                } else {
                    connection.query("SELECT*FROM countries where phonecode='" + req.body.country_phonecode + "' AND id !=" + param_id, function (error, phonecoderesult) {
                        if (phonecoderesult[0] != null || phonecoderesult[0] != undefined) {
                            res.json({success: false, message: "Phonecode found"})
                        } else {

                            var updateData = {
                                "name": req.body.country_name,
                                "sortname": req.body.country_sortname,
                                "phonecode": req.body.country_phonecode,
                                "created_at": created_at,
                                "status": req.body.status,
                                "updated_by": req.decoded.id
                            }

                            connection.query("UPDATE countries SET ? WHERE id = ? AND status!=2", [updateData, param_id], function (error, result) {
                                if (error) {
                                    res.json({"success": false, "message": "error", error});
                                } else if(result.changedRows!=0){
                                    res.json({"success": true, "message": "Country Updated Successfully"});
                                } else{
                                    res.json({"success": false, "message": "sorry some thing went wrong"});
                                }
                            });
                        }
                        ;
                    })
                }
            })
        }
    })
}

exports.editCountry = function (req, res) {
    var param_id = req.params.id;
    var query = connection.query("SELECT * FROM countries WHERE id =" + param_id, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Edit Country", data});
        }
    });
};

exports.deleteCountry = function (req, res) {
    var id = req.params.id;
    var updateData = {
        "status": "2",
        "updated_at": created_at,
        "updated_by": req.decoded.id
    };
    var query = connection.query("UPDATE countries SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Country Deleted Successfully", result});
        }
    });

//    console.log(query.sql);
};



// *********************************************** States APIs  ************************************************************* //

exports.getAllStateList = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;
    var name = req.body.name;
    var country_name = req.body.country_name;
    var status = req.body.status;

    var searchQuery = '';

    if (typeof name !== 'undefined' && name) {
        searchQuery += " AND s.name LIKE '%" + name + "%' ";
    }
    if (typeof country_name !== 'undefined' && country_name) {
        searchQuery += " AND cy.name LIKE '%" + country_name + "%' ";
    }
    if (typeof status !== 'undefined' && status !== null) {
        searchQuery += " AND c.status = " + status;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " + order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY s.id DESC";
    }

    var query = connection.query("SELECT s.*, @count:=@count+1 AS serial_number, cy.name as country_name, s.name as state_name FROM states s LEFT JOIN countries cy ON s.country_id = cy.id , (SELECT @count:=@count:="+offset+") AS X WHERE s.status != 2 " + searchQuery + "  LIMIT " + offset + ", " + limit, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
//            console.log(query.sql);
            connection.query("SELECT count(*) as count FROM states s LEFT JOIN countries cy ON s.country_id = cy.id , (SELECT @count:="+offset+") AS X WHERE s.status != 2 " + searchQuery, function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "State List", result});
            });
        }
    })
}

exports.addState = function (req, res) {

    connection.query("SELECT*FROM states where name='" + req.body.state_name + "'", function (error, stateresult) {
        if (stateresult[0] != null || stateresult[0] != undefined) {
            res.json({success: false, message: "State found"})
        } else {

            var insertData = {
                "name": req.body.state_name,
                "country_id": req.body.country_id,
                "created_at": created_at,
                "created_by": req.decoded.id,
                "status": req.body.status
            }

            var query = connection.query("INSERT INTO states SET ?", insertData, function (error, result) {
                if (error) {
                    res.json({"success": false, "message": "error", error});
                } else {
                    res.json({"success": true, "message": "State Added Successfully"});
                }
            });
        }
        ;
    })
}

exports.updateState = function (req, res) {
    var id = req.params.id;
    connection.query("SELECT*FROM states where name='" + req.body.state_name + "' AND id !=" + id, function (error, stateresult) {
        if (stateresult[0] != null || stateresult[0] != undefined) {
            res.json({success: false, message: "State found"})
        } else {

            var updateData = {
                "name": req.body.state_name,
                "country_id": req.body.country_id,
                "updated_at": created_at,
                "updated_by": req.decoded.id,
                "status": req.body.status
            }

            var query = connection.query("UPDATE states SET ? WHERE id = ? AND status !=2", [updateData, id], function (error, result) {
                if (error) {
                    res.json({"success": false, "message": "error", error});
                } else if(result.changedRows!=0){
                    res.json({"success": true, "message": "State Updated Successfully"});
                } else{
                    res.json({"success": false, "message": "sorry some thing went wrong"});
                }
            });
        }
        ;
    })
}


exports.editState = function (req, res) {
    var param_id = req.params.id;
    var query = connection.query("SELECT * FROM states WHERE id =" + param_id, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Edit State", data});
        }
    });
};

exports.deleteState = function (req, res) {
    var id = req.params.id;
    var updateData = {
        "status": "2",
        "updated_at": created_at,
        "updated_by": req.decoded.id
    };
    var query = connection.query("UPDATE states SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "State Deleted Successfully", result});
        }
    });

//    console.log(query.sql);
};

// *********************************************** City APIs  ************************************************************* //


exports.addCity = function (req, res) {

    connection.query("SELECT * FROM cities where name='" + req.body.city_name + "'", function (error, cityresult) {
        if (cityresult[0] != null || cityresult[0] != undefined) {
            res.json({success: false, message: "City found"})
        } else {
            var insertData = {
                "country_id": req.body.country_id,
                "state_id": req.body.state_id,
                "name": req.body.city_name,
                "status": req.body.status,
                "created_at": created_at,
                "created_by": req.decoded.id
            }

            var query = connection.query("INSERT INTO cities SET ?", insertData, function (error, result) {
                if (error) {
                    res.json({"success": false, "message": "error", error});
                } else {
                    res.json({"success": true, "message": "City Added Successfully", result});
                }
            });
        }
        ;
    })
}

exports.updateCity = function (req, res) {
    var id = req.params.id;
    connection.query("SELECT*FROM cities where name='" + req.body.city_name + "'  AND id !=" + id, function (error, cityresult) {
        if (cityresult[0] != null || cityresult[0] != undefined) {
            res.json({success: false, message: "City found"})
        } else {
            var upadteData = {
                "name": req.body.city_name,
                "country_id": req.body.country_id,
                "state_id": req.body.state_id,
                "status": req.body.status,
                "updated_at": created_at,
                "updated_by": req.decoded.id,
            }

            var query = connection.query("UPDATE cities SET ? WHERE id = ? AND status!=2", [upadteData, id], function (error, result) {
                if (error) {
                    res.json({"success": false, "message": "error", error});
                } else if(result.changedRows!=0){
                    res.json({"success": true, "message": "City Updated Successfully", result});
                } else{
                    res.json({"success": false, "message": "sorry some thing went wrong"});
                }
            });
        }
        ;
    })
}


exports.editCity = function (req, res) {
    var param_id = req.params.id;
    var query = connection.query("SELECT * FROM cities WHERE id =" + param_id, function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "Edit City", data});
        }
    });
};

exports.deleteCity = function (req, res) {
    var id = req.params.id;
    var updateData = {
        "status": "2",
        "updated_at": created_at,
        "updated_by": req.decoded.id
    };
    var query = connection.query("UPDATE cities SET ? WHERE id = ?", [updateData, id], function (error, result) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            res.json({"success": true, "message": "City Deleted Successfully", result});
        }
    });

//    console.log(query.sql);
};


exports.getAllCityList = function (req, res) {

    var limit = req.body.limit;
    var offset = req.body.offset == null ? 0 : req.body.offset;
    var order_column = req.body.order_column;
    var order_direction = req.body.order_direction;    
    var name = req.body.name;
    var state_name = req.body.state_name;
    var country_name = req.body.country_name;
    var status = req.body.status;


    var searchQuery = '';

    if (typeof name !== 'undefined' && name) {
        searchQuery += " AND c.name LIKE '%" + name + "%' ";
    }
    if (typeof state_name !== '' && state_name) {
        searchQuery += " AND s.name LIKE '%" + state_name + "%' ";
    }
    if (typeof country_name !== 'undefined' && country_name) {
        searchQuery += " AND cy.name LIKE '%" + country_name + "%' ";
    }
    if (typeof status !== 'undefined' && status !== null) {
        searchQuery += " AND c.status = " + status;
    }
    if (typeof order_column !== "undefined" && order_column && typeof order_direction !== 'undefined' && order_direction) {
        searchQuery += " ORDER BY " +order_column + " " + order_direction
    } else {
        searchQuery += " ORDER BY c.id DESC";
    }

//    if (filter_value != '') {
//        searchQuery = " AND (cy.name LIKE '%" + filter_value + "%' )";
//    }
    var query = connection.query("SELECT *,  @count:=@count+1 AS serial_number  FROM  ( SELECT c.*,cy.name as country_name, s.name as state_name FROM cities c JOIN countries cy ON c.country_id = cy.id LEFT JOIN states s ON s.id = c.state_id  WHERE c.status != 2 " + searchQuery + "  LIMIT " + offset + ", " + limit+" ) AS Y , (SELECT @count:="+offset+") AS X", function (error, data) {
        if (error) {
            res.json({"success": false, "message": "error", error});
        } else {
            console.log(query.sql);
            connection.query("SELECT count(*) AS count FROM cities c JOIN countries cy ON c.country_id = cy.id LEFT JOIN states s ON s.id = c.state_id WHERE c.status != 2 " + searchQuery, function (error, data1) {
                var result = {'totalRecords': data1, 'records': data};
                res.json({"success": true, "message": "City List", result});
            });
        }
    })
}
