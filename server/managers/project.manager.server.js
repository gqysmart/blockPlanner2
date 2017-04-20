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

function* getUniqueProjectID(projectInfo) {
    var newObject = new ObjectID();
    return newObject.toString();

}

function* newProjectWithThrow(ownerTag, projectInfo) {
    if (projectInfo._id) {
        var err = { no: exceptionMgr.parameterException, context: { parameter: projectInfo } };
        throw err;
    }
    if (!ownerTag) {
        var err = { no: exceptionMgr.parameterException, context: { parameter: ownerTag } };
        throw err;
    }
    var newProject = new Project(projectInfo);
    newProject.tracer.ownerTag = ownerTag;
    if (!newProject.thisTag) {
        newProject.thisTag = yield getUniqueProjectID(projectInfo);
    }
    if (!newProject.assets.terminologyAccessorTag) {
        var sysTerminologyAccessorTagCfg = yield InitConfig.findOne(dbMgr.terminologyAccessorTagCfgCriteria, { value: 1 });
        var newProjectTermAccessor = yield dbMgr.newAccessorEditable("TERMINOLOGY", sysTerminologyAccessorTagCfg.value);
        yield newProjectTermAccessor.save();
        newProject.assets.terminologyAccessorTag = newProjectTermAccessor.thisTag; //构建原型链。
    }
    if (!newProject.assets.ruleAccessorTag) {
        var sysRuleAccessorTagCfg = yield InitConfig.findOne(dbMgr.rootCalcRuleAccessorTagCfgCriteria, { value: 1 });
        var newProjectRuleAccessor = yield dbMgr.newAccessorEditable("RULE", sysRuleAccessorTagCfg.value);
        yield newProjectRuleAccessor.save();
        newProject.assets.ruleAccessorTag = newProjectRuleAccessor.thisTag; //构建原型链
    }
    if (!newProject.version) {
        newProject.version = sysConf.version;
    }
    yield newProject.save();
    return newProject.thisTag;
};

function* getProjectReadOnlyWithThrow(criteria, project) { //project 对外editable太危险了，因为有可能会修改assets，这样plan等pdc的环境就没办法保持稳定。但不开放好像也不行，实际使用时在考虑考虑后果。
    var _project = { _id: 0 };
    _.defaults(_project, project);
    var project = yield Project.findOne(criteria, project);
    return project;
}

function* allOwnerProjectsReadOnlyWithThrow(ownerTag, criteria, project) {
    if (!ownerTag) {
        var err = { no: exceptionMgr.parameterException, context: { parameter: ownerTag } };
        throw err;
    }
    var _project = { _id: 0 };
    _.defaults(_project, project);
    var _criteria = { "tracer.ownerTag": ownerTag };
    _.defaults(_criteria, criteria);
    var projects = yield Project.find(_criteria, project).exec();
    return projects;
}

module.exports.newProjectWithThrow = async(newProjectWithThrow);