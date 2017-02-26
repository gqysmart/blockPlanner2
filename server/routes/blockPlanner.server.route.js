var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require("path");

var rootDir = "server/apps/"
var appDir = "blockPlanner/";

//middleware specific to index/
router.use(function(req, res, next) {
    console.log(req.url);
    next();
});
//home page
router.get('/', function(req, res, next) {
    res.render(path.join(appDir + "index.html"));
    next();

});

//app.js 
router.get("/app.js",
    function(req, res, next) {
        var data = fs.readFileSync(path.join(rootDir, appDir, "app.js")).toString();

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data.toString());
        res.end();
        console.log(data);
        next();

    });
module.exports = router;