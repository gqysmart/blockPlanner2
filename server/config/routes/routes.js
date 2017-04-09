/**
 * 
 * 
 */

const fs = require('fs');
const path = require("path");
const conf = require("../config")
const users = require("../../controllers/users.controller.server");
const assets = require("../../controllers/assets.controller.server");
const cost = require("../../controllers/cost.controller.server");
const auth = require("../middlewares/authorization");
const planManager = require("../../managers/plan.manager.server");
const calcRuleManager = require("../../managers/calcRule.manager.server");

const ObjectID = require("mongodb").ObjectID;

const appTitle = conf.appTitle;
const fail = {
    failureRedirect: "/login"
};


/** expose */

module.exports = function(app, passport) {

    const pauth = passport.authenticate.bind(passport);


    //user routes
    //home page
    app.get('/', auth.requiresLogin, function(req, res, next) {
        res.redirect("/home");
    });
    app.get("/home/login", users.login);
    //  app.get("/signup", users.sigup);
    //  app.get('/logout', users.logout);
    app.post('/users', users.create);
    app.post('/users/session',
        pauth('local', {
            failureRedirect: '/home/login',
            failureFlash: 'Invalid email or password.'
        }),
        users.actionAfterLogin);

    app.get("/home/signup", users.signup);

    ///resources
    app.param("app", function(req, res, next, appname) {

        var appNames = ["plan", "home"];
        if (-1 === appNames.indexOf(appname)) {
            res.end("hello"); //404
        } else {

            next();
        }

    });
    app.get("/:app/styles/*.css", assets.getCSS);


    app.get("/:app/scripts/*.js", assets.getJS);

    //fonts
    app.get('/:app/fonts/*', assets.getFont);

    //profile picture
    app.get('/:app/img/profile/*', assets.getAvanta);


    app.get("/project/:projectId/plan/:planId", function(req, res, next) {

    });
    app.get("/:app", function(req, res, next) {
        //test plan
        var app = req.params.app;
        res.render(app + "/views/index");
        planManager.createPlan(new ObjectID(), function(plan) {



        })





    });


    app.get("/plan/cost/info", cost.loadCostInfo);



    // assume 404 since no middleware responded
    // app.use(function(req, res) {
    //     const payload = {
    //         url: req.originalUrl,
    //         error: 'Not found'
    //     };
    //     if (req.accepts('json')) return res.status(404).json(payload);
    //     res.status(404).render('404', payload);
    // });


};