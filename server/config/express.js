const express = require("express");
const serveStatic = require("serve-static");
const serveFavicon = require("serve-favicon");
const session = require("express-session");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const csrf = require("csurf");
const cors = require("cors");
const upload = require("multer")();
const mongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const winston = require("winston");
const helpers = require("view-helpers");
const path = require("path");

const conf = require("./config");
const env = process.env.NODE_ENV || "development";

const secret = "secret";

const defaultErrorHandler = function(err, res, req, next) {
    console.error(err.stack);
    next(err);

};
/** expose */
module.exports = function(app, passport) {
    app.use(compression({
        threshold: 512
    }));

    app.use(cors());



    //add middleware here!
    //static resourse
    // app.use(serveFavicon("server/app/assets/favicon.ico"));
    app.use(serveStatic(path.join(__dirname, "..", "/app/public"), {}));

    //log:use winston on production
    let log = "dev";
    if (env !== "development") {
        log = {
            stream: {
                write: message => winston.info(message)
            }
        }
    }
    if (env !== "test") {
        app.use(morgan(log));
    }

    // bodyParser should be above methodOverride
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(upload.single("image"));
    app.use(methodOverride(function(req) {
        if (req.body && typeof req.body === "object" && "_method" in req.body) {
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    //cookie
    app.use(cookieParser());
    app.use(cookieSession({ secret: secret }));
    app.use(session({
        resave: false,
        saveUninitialized: true,
        secret: secret,
        store: new mongoStore({

            url: conf.dbUrl,
            collection: "sessions"
        })
    }));
    //use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    //
    app.use(flash());
    //
    app.use(helpers(conf.appTitle));

    //
    if (env !== "test") {
        app.use(csrf());
        app.use(function(req, res, next) {
            res.locals.csrf_token = req.csrfToken();
            next()
        });
    }
    if (env === "development") {
        app.locals.pretty = true;
    }


    // app.engine("html", require('ejs').renderFile);
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "..", "/app/assets/"));

    //
    return app;
};