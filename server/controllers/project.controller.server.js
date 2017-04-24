/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const fs = require("fs");
const { wrap: async, co: co } = require("co");
const projectMgr = require("../managers/project.manager.server");
const usrMgr = require("../managers/user.manager.server");

module.exports.createProject = async(function*(req, res, next) {
    var userToken = req.user.authToken;
    var projectAccessorTag = yield usrMgr.getSelfProjectAccessorTagWithThrow(userToken);
    var projectInfo = req.body;
    var info = yield projectMgr.addProjectWithThrow(projectAccessorTag, projectInfo);
    //notify success to web.
    res.end();
});

module.exports.loadProject = function(req, res, next) {

    var userID = req.user._id;
    if (!userID) {
        res.redirect("/login");
    }
    var projectInfo = null;

    res.end();
};

//当东西可以不被独有时，可以用[]populate比较合适；独占时，使用ownerTag比较好，虽然比较占空间。；name用populate，记录还是用tracer.owner