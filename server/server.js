/**
 * 
 * 
 * 
 */
require('dotenv').config();
const fs = require("fs");
const join = require("path").join;
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const config = require("./config/config");

const models = join(__dirname, "models");
const port = process.env.PORT || 3200;
const app = express();

/** expose */
module.exports = app;
//

fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*\.js$/))
    .forEach(file => require(join(models, file)));
// routes
require("./config/passport")(passport);
require("./config/express")(app, passport);
require("./config/routes/routes")(app, passport);

connect()
    .on("error", console.log)
    .on('disconnected', connect)
    .once('open', listen);


function connect() {
    const options = {
        server: { socketOptions: { keepAlive: 1 } }
    };

    return mongoose.connect(config.dbUrl, options).connection;
};


function listen() {
    app.listen(port,
        function() {
            console.log('server listening on port:' + port);
        });


}

module.exports = app;