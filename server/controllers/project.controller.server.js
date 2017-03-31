/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const fs = require("fs");
const projectManager = require("../managers/project.manager.server");
const planManager = require("../managers/plan.manager.server");

module.exports.createProject = function(req, res, next) {


    res.end();
};

module.exports.loadProject = function(req, res, next) {

    var userID = req.user._id;
    if (!userID) {
        res.redirect("/login");
    }
    var projectInfo = null;

    res.end();
};

//当东西可以不被独有时，可以用[]populate比较合适；独占时，使用ownerTag比较好，虽然比较占空间。；name用populate，记录还是用tracer.owner