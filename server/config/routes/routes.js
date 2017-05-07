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
const project = require("../../controllers/project.controller.server");

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
    app.get("/home", auth.requiresLogin, function(req, res, next) {
        res.render("home/views/index");
    })
    app.get("/home/login", users.login);
    //  app.get("/signup", users.sigup);
    //  app.get('/logout', users.logout);
    app.post('/home/users', users.create);
    app.post('/home/users/session',
        pauth('local', {
            failureRedirect: '/home/login',
            failureFlash: 'Invalid email or password.'
        }),
        users.actionAfterLogin);

    app.get("/home/signup", users.signup);
    app.post("/home/createProject", auth.requiresLogin, project.createProject);
    app.get("/home/openProject/:projectName", auth.requiresLogin, project.openProject);
    app.get("/home/projects", auth.requiresLogin, project.loadUserProjectsOverview);

    ///resources
    app.param("app", function(req, res, next, appname) {

        var appNames = ["plan", "home", "project"];
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
    app.get('/:app/images/*', assets.getImage);

    //profile picture
    app.get('/:app/img/profile/*', assets.getAvanta);

    // app.get("/:app", auth.requiresLogin, function(req, res, next) {
    //     //test plan
    //     var app = req.params.app;
    //     res.render(app + "/views/index");
    // });

    app.post("/plan/ruleValueChanged", auth.requiresLogin, function(req, res, next) {
        //项目规则，还是方案规则；
    });

    //project
    app.get("/project/:projectTag", auth.requiresLogin, function(req, res, next) {
        var projectTag = req.params["projectTag"];
        res.render("project/views/index", { projectTag: projectTag })
    });
    app.post("/project/rule", auth.requiresLogin, project.getProjectRule);
    app.post("/project/modifyRulesValue", auth.requiresLogin, project.modifyProjectRuleValue);



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