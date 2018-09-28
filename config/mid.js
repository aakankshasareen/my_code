var sanitizeHtml = require("sanitize-html")

module.exports = {

    mid: function(req, res, next) {
        var value = [],
            array2 = []

        for (var key in req.body) {

            if (req.body.hasOwnProperty(key)) {
                item = req.body[key];

                var html = sanitizeHtml(item, {
                    allowedTags: [],
                    allowedAttributes: {
                        'a': ['href']
                    }
                });

                value.push(html)
            }

        }
        for (var name in req.body) {
            if (req.body.hasOwnProperty(name)) {

                array2.push(name)

            }

        }


        var obj = {};
        for (var i = 0; i < array2.length; i++) {
            obj[array2[i]] = value[i];
        }

        req.body = obj

        return next();
    },
    query: function(req, res, next) {
        var value1 = [],
            array3 = []

        for (var key in req.query) {

            if (req.query.hasOwnProperty(key)) {
                item = req.query[key];

                var html = sanitizeHtml(item, {
                    allowedTags: [],
                    allowedAttributes: {
                        'a': ['href']
                    }
                });

                value1.push(html)
            }

        }
        for (var name in req.query) {
            if (req.query.hasOwnProperty(name)) {

                array3.push(name)

            }

        }


        var obj1 = {};
        for (var i = 0; i < array3.length; i++) {
            obj1[array3[i]] = value1[i];
        }

        //console.log("obj1",obj1)

        req.query = obj1

        return next();
    },


}
