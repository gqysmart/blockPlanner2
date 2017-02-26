var express = require("express");
var serveStatic = require("serve-static");
var serveFavicon = require("serve-favicon");
var blockPlanner = require("../routes/blockPlanner.server.route");

var defaultErrorHandler = function(err, res, req, next) {
    console.error(err.stack);
    next(err);

};

module.exports = (function() {
    var app = express();
    //add middleware here!
    //static resourse
    app.use(serveFavicon("server/public/favicon.ico"));
    app.use(serveStatic("server/public", {}));

    //app dispatcher
    app.use("/bp", blockPlanner);



    //error report
    app.use(defaultErrorHandler);

    app.engine("html", require('ejs').renderFile);
    app.set("views", "server/apps")

    //
    return app;
}());