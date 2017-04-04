/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const { wrap: async } = require("co");
const fs = require("fs");
const mongoose = require("mongoose");
const assert = require("assert");
const ObjectID = require("mongoDB").ObjectID;

const Project = mongoose.model("Project");
const InitConfig = mongoose.model("InitConfig");

var projectManager = {};
module.exports = projectManager;
projectManager.createProject = async(function*(owner, projectInfo, cb) {

    if (typeof(projectInfo) === "function") {
        cb = projectInfo;
        projectInfo = null;
    }

    var newProject = new Project(projectInfo);
    // newProject.name = projectInfo.name;
    // newProject.version = projectInfo.version || newProject.version;
    newProject.tracer.thisTag = new ObjectID();
    newProject.tracer.ownerTag = owner;
    // newProject.security.mode = projectInfo.security.mode || newProject.security.mode;
    // newProject.security.config = projectInfo.security.config;

    var doc = yield newProject.save();
    return cb(doc.toObject());

});