var express = require("express");
var serveStatic = require("serve-static");
var serveFavicon = require("serve-favicon");
var indexMiddleware = require("./routes/index.server.route");

var defaultErrorHandler = function(err, res, req, next) {
    console.error(err.stack);
    next(err);

};

module.exports = (function() {
    var app = express();
    //add middleware here!
    //static resourse
    app.use(serveFavicon("app/public/favicon.ico"));
    app.use(serveStatic("app/public", {}));

    app.use("/", indexMiddleware);



    //error report
    app.use(defaultErrorHandler);

    //
    return app;
}());