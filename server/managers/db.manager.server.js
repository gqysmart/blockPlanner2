/**
 * 
 * 
 * 
 */

const path = require("path");
const _ = require("lodash");
const { wrap: async, co: co } = require("co");
const assert = require("assert");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectID = require("mongoDB").ObjectID;
const Accessor = mongoose.model("Accessor");
const sysConfig = require("../config/sys");
const version = sysConfig.version;
//似乎降低了mongoose的灵活性。

//初始化所有mongoose model

const sysinitedCfgCriteria = { name: "systemInited", category: "system", version: version };
const rootCalcRuleAccessorTagCfgCriteria = { name: "rootCalcRuleAccessorTag", category: "system", version: version };
const terminologyAccessorTagCfgCriteria = { name: "terminologyAccessorTag", category: "system", version: version };
const systemLogAccessorTagCfgCriteria = { name: "systemLogAccessorTag", category: "system", version: version };
module.exports.rootCalcRuleAccessorTagCfgCriteria = (function() {
    var criteria = {};
    _.defaults(criteria, rootCalcRuleAccessorTagCfgCriteria);
    return criteria; //防止污染
})();
module.exports.terminologyAccessorTagCfgCriteria = (function() {
    var criteria = {};
    _.defaults(criteria, terminologyAccessorTagCfgCriteria);
    return criteria; //防止污染
})();
module.exports.systemLogAccessorTagCfgCriteria = (function() {
    var criteria = {};
    _.defaults(criteria, systemLogAccessorTagCfgCriteria);
    return criteria; //防止污染
})();
module.exports.sysinitedCfgCriteria = (function() {
    var criteria = {};
    _.defaults(criteria, sysinitedCfgCriteria);
    return criteria; //防止污染
})();


function getUniqTag() {
    return new ObjectID();
}
module.exports.getUniqTag = getUniqTag;
module.exports.initAccessor = initAccessor;
module.exports.initLogAccessor = initLogAccessor;
module.exports.initCalcRuleAccessor = initCalcRuleAccessor;
module.exports.initTerminologyAccessor = initTerminologyAccessor;

function initAccessor(accessor) {
    accessor.thisTag = getUniqTag();
    accessor.timemark.lastModifed = Date.now();
}

function initLogAccessor(accessor) {
    initAccessor(accessor);
    accessor.special = { logLevel: 7 };
}

function initCalcRuleAccessor(accessor) {
    initAccessor(accessor);
}

function initTerminologyAccessor(accessor) {
    initAccessor(accessor);

}



const defaultHoldOptions = {
    maxLagTime: 1000 //一秒
};
/**
 * 
 * @param {*} modelName 访问控制块mongoose model 名。
 * @param {*} accessorID 
 * @param {*} operOptions 
 */

//访问器 有并发访问器，安全访问器，跟踪访问器等等。
function createAccessorToken() {
    return new ObjectID();
}
/**
 * is protoAccessorTag in proto chainof accessorTag
 * @param {*} protoAccessorTag 
 * @param {*} accessorTag 
 */
function* isProtoOf(protoAccessorTag, accessorTag) {

    var accessor = yield Accessor.findOne({ thisTag: accessorTag });
    if (!accessor) {
        return false;
    }
    if (!accessor.proto.forward) {
        return false;
    } else {
        if (accessor.proto.forward === protoAccessorTag) {
            return true;
        }
        var forwardAccessor = yield Accessor.findOne({ thisTag: accessor.proto.forward });
        return yield isProtoOf(protoAccessorTag, forwardAccessor.thisTag);

    }

}
module.exports.isProtoOf = async(isProtoOf);

function* holdLockAndOper(targetAccessor, oper, operOptions) { //调整到db.manager作为通用锁访问，相应的组件有access{}；schema支持继承么？
    var accessor = yield Accessor.findOne({ _thisTag: targetAccessor });
    if (!accessor) {
        var err = { no: -1, desc: "accessor is not exist!" };
        throw (err);
    }

    function pause(miliseconds) {
        var promise = new Promise(function(resolve, reject) {
            setTimeout(function() { resolve(miliseconds) }, miliseconds);
        });
        return promise;
    };

    function pauseAndRehold() {
        var randomPauseTime = Math.random() * 500;
        var promise = new Promise(function(resolve, reject) {
            co(function*() {
                yield pause(randomPauseTime);
                yield co(holdLockAndOper(targetAccessor, oper, operOptions));
                resolve(randomPauseTime);
            });
        });
        return promise;
    };

    function doOpers() {
        var promise = new Promise(function(resolve, reject) {
            co(function*() {
                try {
                    oper(operOptions);

                } catch (e) {
                    throw (e);

                } finally {
                    accessor.concurrent.token = null;
                    accessor.markModified("concurrent.token");
                    yield accessor.save();
                    resolve();
                }
            });
        });
        return promise;
    }; //end doOpers


    //参数调整
    if (!operOptions) { operOptions = {}; };
    operOptions = _.defaults(operOptions, defaultHoldOptions);
    if (!operOptions._startTime) { operOptions._startTime = new Date() }; //计时
    if (!operOptions._accessToken) {
        operOptions._accessToken = createAccessorToken(); //新建随机accesstag，为防止死锁，需要考虑按规则强行释放。
    }
    //
    if (accessor.concurrent.token && accessor.concurrent.hostTag === operOptions._accessToken) { //重入
        yield doOpers();
        return true;
    } else if (accessor.concurrent.token !== operOptions._accessToken) {
        var now = new Date();
        if (now.getTime() - operOptions._startTime.getTime() > operOptions.maxLagTime) { return false } //操作失败。
        else { //尝试随机时间后，再尝试修改
            yield pauseAndRehold(); //0.5秒以内，重新尝试一次。
        }
    } else if (!accessor.concurrent.token) {
        accessor.concurrent.token = operOptions._accessToken;
        accessor.markModified("concurrent.token");
        yield accessor.save();
        //重新查找一次，确认目前是自己占用了锁。
        accessor = yield Accessor.findOne({ _thisTag: targetAccessor });
        if (accessor.access.token !== operOptions._accessToken) {
            var now = new Date();
            if (now.getTime() - operOptions._startTime.getTime() > operOptions.maxLagTime) { return false } //操作失败。
            else { //尝试随机时间后，再尝试修改
                yield pauseAndRehold(); //0.5秒以内，重新尝试一次。
            }

        } else {
            yield doOpers();
            return true;
        }
    }

}
module.exports.holdLockAndOper = async(holdLockAndOper);