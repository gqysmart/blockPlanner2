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
const exceptionMgr = require("./exception.manager.server");
const dbMgr = require("./db.manager.server");
const incubatorMgr = require("./incubator.manager.server");


const projectSummaryQName = "江苏嘉城/项目/项目一览";

function* getUniqueProjectID(projectInfo) {
    var newObject = new ObjectID();
    return newObject.toString();

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

function* _addProjectWithThrow(accessorTag, projectInfo) {
    if (!projectInfo) { projectInfo = {} };
    var _projectInfo = {};

    if (!projectInfo.name) {
        _projectInfo.name = (new ObjectID()).toString();
    } else { _projectInfo.name = projectInfo.name; }
    var projectName = yield getUniqueProjectID(projectInfo);

    if (!projectInfo.assets || !projectInfo.assets.incubator || !projectInfo.assets.incubator.accessorTag) {
        var newIncubatorAccessorTag = yield dbMgr.addAccessorWithThrow("Incubator");
        _projectInfo.assets = { incubator: { accessorTag: newIncubatorAccessorTag } };
        var newIncubator = yield incubatorMgr.addIncubatorWithThrow(newIncubatorAccessorTag);
        _projectInfo.assets.incubator.name = newIncubator.name;
    } else {

        ///do later;
    }
    return yield dbMgr.addOneItemToAccessorWithThrow(accessorTag, _projectInfo);
};



module.exports.addProjectWithThrow = async(_addProjectWithThrow);