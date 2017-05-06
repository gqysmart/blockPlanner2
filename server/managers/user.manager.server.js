const { respond } = require("../utils");
const path = require("path");
const _ = require("lodash");
const { wrap: async } = require("co");
const fs = require("fs");
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
    if (!_userInfo.userToken) {
        _userInfo.userToken = (new ObjectID()).toString();
    }
    if (!_userInfo.profile || !_userInfo.profile.accessorTag) {
        _userInfo.profile = { accessorTag: yield dbMgr.addAccessorWithThrow("Profile") };
        _userInfo.profile.name = (new ObjectID()).toString();
    }

    var selfProjects = { accessorTag: yield dbMgr.addAccessorWithThrow("Project") };
    yield dbMgr.addOneItemToAccessorWithThrow(_userInfo.profile.accessorTag, { name: _userInfo.profile.name, userToken: _userInfo.userToken, selfProjects: { accessorTag: selfProjects.accessorTag } });
    return yield dbMgr.addOneItemToAccessorWithThrow(userAccessorTag, _userInfo);
};
module.exports.addUser = async(addUser);

function* getSelfProjectAccessorTagWithThrow(userToken) {
    var accessorTag = yield dbMgr.getSysConfigValue(dbMgr.mainUserAccessorTagCfgCriteria);
    var user = yield dbMgr.theOneItemInAccessorWithThrow(accessorTag, { userToken });
    if (!user) {
        var err = { no: exceptionMgr.parameterException, context: { userToken } };
        throw err;
    }
    var profile = yield dbMgr.theOneItemInAccessorWithThrow(user.profile.accessorTag, { name: user.profile.name });
    return profile.selfProjects.accessorTag;
};
module.exports.getSelfProjectAccessorTagWithThrow = async(getSelfProjectAccessorTagWithThrow);

function* _getAllUserSelfProjectInfoWithThrow(userToken) {

    var selfProjectAccessorTag = yield getSelfProjectAccessorTagWithThrow(userToken);
    var projectInfos = yield dbMgr.allItemsInAccessorWithThrow(selfProjectAccessorTag, {}, { name: 1, "assets.incubator": 1 });
    return projectInfos;
}
module.exports.getAllUserSelfProjectInfoWithThrow = async(_getAllUserSelfProjectInfoWithThrow);

function* _getUserSelfProjectInfoWithThrow(userToken, projectTag) {

    var selfProjectAccessorTag = yield getSelfProjectAccessorTagWithThrow(userToken);
    var projectInfo = yield dbMgr.theOneItemInAccessorWithThrow(selfProjectAccessorTag, { name: projectTag }, { name: 1, "assets.incubator": 1 });
    return projectInfo;
}
module.exports.getUserSelfProjectInfoWithThrow = async(_getUserSelfProjectInfoWithThrow);