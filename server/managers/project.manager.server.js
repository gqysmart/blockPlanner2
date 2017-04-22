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
const InitConfig = mongoose.model("InitConfig");
const sysConf = require("../config/sys");
const Project = mongoose.model("Project");
const exceptionMgr = require("./exception.manager.server");
const dbMgr = require("./db.manager.server");
const incubatorMgr = require("./incubator.manager.server");

function* getUniqueProjectID(projectInfo) {
    var newObject = new ObjectID();
    return newObject.toString();

}


function* getProjectReadOnlyWithThrow(criteria, project) { //project 对外editable太危险了，因为有可能会修改assets，这样plan等pdc的环境就没办法保持稳定。但不开放好像也不行，实际使用时在考虑考虑后果。
    var _project = { _id: 0 };
    _.defaults(_project, project);
    var project = yield Project.findOne(criteria, project);
    return project;
}

function* allOwnerProjectsReadOnlyWithThrow(orgnizerName, criteria, project) {
    if (!orgnizerName) {
        var err = { no: exceptionMgr.parameterException, context: { parameter: orgnizerName } };
        throw err;
    }
    var _project = { _id: 0 };
    _.defaults(_project, project);
    var _criteria = { "tracer.orgnizerName": orgnizerName };
    _.defaults(_criteria, criteria);
    var projects = yield Project.find(_criteria, project).exec();
    return projects;
}

function* _addProjectWithThrow(orgnizerName, projectInfo) {

    if (!orgnizerName) {
        var err = { no: exceptionMgr.parameterException, context: { parameter: orgnizerName } };
        throw err;
    }

    var newProject = new Project(projectInfo); //暂时直接用model，因为没有accessor了。
    newProject.tracer.orgnizerName = orgnizerName;
    if (!newProject.thisTag) {
        newProject.thisTag = yield getUniqueProjectID(projectInfo);
    }
    var newIncubatorAccessor = yield dbMgr.newAccessorEditableWithThrow("INCUBATOR");
    yield newIncubatorAccessor.save();
    newProject.assets.incubatorAcessorTag = newIncubatorAccessor.thisTag;
    var rootIncubator = yield incubatorMgr.newIncubatorEditableWithAllocateContainerWithThrow(newIncubatorAccessor.thisTag, newProject.thisTag);
    newProject.assets.incubator = rootIncubator.name;
    if (!newProject.version) {
        newProject.version = sysConf.version;
    }
    yield newProject.save();
    return newProject.thisTag;
};
module.exports.newProjectWithThrow = async(newProjectWithThrow);