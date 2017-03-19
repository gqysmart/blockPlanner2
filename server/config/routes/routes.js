/**
 * 
 * 
 */

const fs = require('fs');
const path = require("path");
const conf = require("../config")
const users = require("../../controllers/users.controller.server");
const assets = require("../../controllers/assets.controller.server");
const auth = require("../middlewares/authorization");
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
        res.render("index", { title: appTitle });
        next();
    });
    app.get("/login", users.login);
    //  app.get("/signup", users.sigup);
    //  app.get('/logout', users.logout);
    app.post('/users', users.create);
    app.post('/users/session',
        pauth('local', {
            failureRedirect: '/login',
            failureFlash: 'Invalid email or password.'
        }),
        users.session);

    app.get("/signup", users.signup);

    ///resources

    app.get("/styles/*.css", assets.getCSS);


    app.get("/scripts/*.js", assets.getJS);

    //fonts
    app.get('/fonts/*', assets.getFont);

    //profile picture
    app.get('/img/profile/*', assets.getAvanta);

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