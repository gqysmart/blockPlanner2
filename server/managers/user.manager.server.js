const { respond } = require("../utils");
const path = require("path");
const _ = require("lodash");
const { wrap: async } = require("co");
const fs = require("fs");
const mongoose = require("mongoose");
const assert = require("assert");
const ObjectID = require("mongoDB").ObjectID;
const sysConf = require("../config/sys");
const exceptionMgr = require("./exception.manager.server");
const dbMgr = require("./db.manager.server");

function* addUser(userInfo, userAccessorTag) {
    if (!userAccessorTag) {
        userAccessorTag = yield dbMgr.getSysConfigValue(dbMgr.mainUserAccessorTagCfgCriteria);
    };
    var _userInfo = {};
    _.defaults(_userInfo, userInfo);
    if (!_userInfo.authToken) {
        _userInfo.authToken = (new ObjectID()).toString();
    }
    if (!_userInfo.profile || !_userInfo.profile.accessorTag) {
        _userInfo.profile = { accessorTag: yield dbMgr.addAccessorWithThrow("Profile") };
        _userInfo.profile.name = (new ObjectID()).toString();
    }

    var selfProjects = { accessorTag: yield dbMgr.addAccessorWithThrow("Project") };
    yield dbMgr.addOneItemToAccessorWithThrow(_userInfo.profile.accessorTag, { name: _userInfo.profile.name, userToken: _userInfo.authToken, selfProjects });
    return yield dbMgr.addOneItemToAccessorWithThrow(userAccessorTag, _userInfo);
};
module.exports.addUser = async(addUser);

function* getSelfProjectAccessorTagWithThrow(authToken) {
    var accessorTag = yield dbMgr.getSysConfigValue(dbMgr.mainUserAccessorTagCfgCriteria);
    var user = yield dbMgr.theOneItemInAccessorWithThrow(accessorTag, { authToken });
    if (!user) {
        var err = { no: exceptionMgr.parameterException, context: { authToken } };
        throw err;
    }
    var profile = yield dbMgr.theOneItemInAccessorWithThrow(user.profile.accessorTag, { name: user.profile.name });
    return profile.selfProjects.accessorTag;
};
module.exports.getSelfProjectAccessorTagWithThrow = async(getSelfProjectAccessorTagWithThrow);