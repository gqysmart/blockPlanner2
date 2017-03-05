var app = require("./config/express");
var config = require("./config/config");
var fs = require("fs");
var models = "server/models";
var dotenv = require("dotenv");

dotenv.config();

var mongoose = require("mongoose");

fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*\.js$/))
    .forEach(file => require(join(models, file)));

connect()
    .on("error", console.log)
    .on('disconnected', connect)
    .once('open', listen);


function connect() {
    var options = {
        server: { socketOptions: { keepAlive: 1 } }
    };

    return mongoose.connect(config.dbUrl, options).connection;
};

var port = config.port;

function listen() {
    app.listen(port,
        function() {
            console.log('server listening on port:' + port);
        });


}

module.exports = app;