/**
 * 
 * 
 */

"use strict";
const mongoose = require("mongoose");
const { wrap: async } = require("co");
const { respond } = require("../utils");
const User = mongoose.model("User");
const conf = require("../config/config");
const appTitle = conf.appTitle;

/**
 * expose
 * 
 */

module.exports.login = function(req, res) {
    respond(res, "auth", { title: appTitle });
};

module.exports.load = async(function*(req, res, next, _id) {
    const criteria = { _id };
    try {
        req.profile = yield User.load({ criteria });
        if (!req.profile) return next(new Error("User not found"));
    } catch (err) {
        next(err);
    }

    next();

});

module.exports.create = async(function*(req, res) {

    const user = new User(req.body);
    user.provider = "local";
    try {
        yield user.save();
        req.logIn(user, err => {
            if (err) req.flash("info", "sorry,we are not able to log you in!");
            return res.redirect("/");
        });
    } catch (err) {
        const errors = Object.keys(err.errors).map(field => err.errors[field].message);
        respond(res, "reg", { title: appTitle });

    }

});

module.exports.signup = function(req, res) {
    respond(res, "reg", { title: appTitle });

};
exports.session = login;

/**
 * Login
 */

function login(req, res) {
    const redirectTo = req.session.returnTo ?
        req.session.returnTo :
        '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
};