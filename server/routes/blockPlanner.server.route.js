var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require("path");
var conf = require("../config/config.js")

var rootDir = "server"
var appDir = "app";
var appTitle = conf.appTitle;

//middleware specific to index/
router.use(function(req, res, next) {
    console.log(req.url);
    next();
});
//home page
router.get('/', function(req, res, next) {
    res.render(path.join(".", "index.html"), { title: appTitle });
    next();
});
router.get("/404.html", function(req, res, next) {
    res.render(path.join(".", "404.html"), { title: appTitle })
});
router.get("/auth.html", function(req, res, next) {
    res.render(path.join(".", "auth.html"), { title: appTitle })
});
router.get("/reg.html", function(req, res, next) {
    res.render(path.join(".", "reg.html"), { title: appTitle })
});


//app.js 
router.get("/scripts/*.js",
    function(req, res, next) {
        var fileName = req.params[0];
        var relativeFileName = path.join(rootDir, appDir, "scripts/", fileName + ".js");
        var data = fs.readFileSync(relativeFileName).toString();

        res.writeHead(200, { "Content-Type": "application/x-javascript" });
        res.write(data.toString());
        res.end();
        console.log(data);
        next();

    });
//app.css 
router.get("/styles/*.css",
    function(req, res, next) {
        var fileName = req.params[0];
        var relativeFileName = path.join(rootDir, appDir, "styles/", fileName + ".css");
        var data = fs.readFileSync(relativeFileName).toString();

        res.writeHead(200, { "Content-Type": "text/css" });
        res.write(data.toString());
        res.end();
        console.log(data);
        next();

    });

//app.js 

//app.fonts 
router.get("/fonts/*.*",
    function(req, res, next) {
        var fileName = req.params[0];
        var extName = req.params[1];
        var relativeFileName = path.join(rootDir, appDir, "fonts/", fileName + extName);
        var data = fs.readFileSync(relativeFileName).toString();

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data.toString());
        res.end();
        console.log(data);
        next();

    });


module.exports = router;