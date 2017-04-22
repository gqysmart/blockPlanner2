const { respond } = require("../utils");
const path = require("path");
const _ = require("lodash");
const { wrap: async } = require("co");
const fs = require("fs");
const mongoose = require("mongoose");
const assert = require("assert");
const ObjectID = require("mongoDB").ObjectID;
const PDCMgr = require("./pdc.manager.server");
const dbMgr = require("./db.manager.server");
const exceptionMgr = require("./exception.manager.server");


function* _addOrgnizerAccessorIndepence(dependenceOrgnizerAccessorTag) {
    var orgnizerAccessorTag = dependenceOrgnizerAccessorTag;
    if (!orgnizerAccessorTag) {
        orgnizerAccessorTag = yield dbMgr.getSysConfigValue(dbMgr.orgnizerAccessorTagCfgCriteria);
    }
    var accessorTag = yield dbMgr.addAccessorWithThrow("Orgnizer", orgnizerAccessorTag);
    return accessorTag;
}


function* _addOrgnizerWithThrow(orgnizerAccessorTag, orgnizerInfo) {
    if (!orgnizerInfo) { orgnizerInfo = {}; }
    if (!orgnizerInfo.assets) { orgnizerInfo.assets = {} };
    if (!orgnizerInfo.assets.projectsAccessorTag) {
        orgnizerInfo.assets.projectsAccessorTag = yield dbMgr.addAccessorWithThrow("Project");
    }
    var newOrgnizer = yield dbMgr.addOneItemToAccessorWithThrow(orgnizerAccessorTag, orgnizerInfo, { name: 1 });
    return newOrgnizer.name;
}

function* _updateOrgnizerWithThrow(orgnizerAccessorTag, criteria, updateOrgnizerInfo) {
    var items = yield dbMgr.updateItemsInAccessorWithThrow(orgnizerAccessorTag, criteria, updateOrgnizerInfo);
    return items[0];
};

function* _getOrgnizerWithThrow(orgnizerAccessorTag, criteria) {
    return yield dbMgr.theOneItemAlongProtoToAccessorWithThrow(orgnizerAccessorTag, criteria);

};

funciton * _addProjectToOrgnizer(orgnizerAccessorTag, orgnizerName, projectInfo) {
    var orgnizer = yield _getOrgnizerWithThrow(orgnizerAccessorTag, { name: orgnizerName }, { assets: 1 });
    var project = yield addOneItemToAccessorWithThrow(orgnizer.assets.projectsAccessorTag, projectInfo);
    return project;
};

function* _getAllProjectsOfOrgnizer(orgnizerAccessorTag, orgnizerName, projectCriteria) {
    var orgnizer = yield _getOrgnizerWithThrow(orgnizerAccessorTag, { name: orgnizerName }, { assets: 1 });
    var _projectCriteria = projectCriteria;
    var projects = yield dbMgr.allItemsInAccessorWithThrow(orgnizer.assets.projectsAccessorTag, _projectCriteria);
    return projects;
}