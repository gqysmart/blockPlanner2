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

function* addUserWithThrow(userAccessorTag, userInfo) {
    if (!userAccessorTag) {
        userAccessorTag = yield dbMgr.getSysConfigValue(dbMgr.mainUserAccessorTagCfgCriteria);
    };
    var _userInfo = {};
    _.defaults(_userInfo, userInfo);
    if (!_userInfo.userToken) {
        _userInfo.userToken = (new ObjectID()).toString();
    }
    if (!_userInfo.infoAccessorTag) {
        var sysAccessorTag = yield dbMgr.getSysConfigValue(dbMgr.mainInfoblockAccessorTagCfgCriteria);
        _userInfo.infoAccessorTag = yield dbMgr.addAccessorWithThrow("InfoBlock", sysAccessorTag);
    }
    return yield dbMgr.addOneItemToAccessorWithThrow(userAccessorTag, _userInfo);
};
module.exports.addUserWithThrow = async(addUserWithThrow);

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