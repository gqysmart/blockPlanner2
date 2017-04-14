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
const exceptionMgr = require("./exception.manager.server");
//
const defaultHoldOptions = {
    $_maxLagTime: 3000, //一秒
    $_async: false //同步执行，还是异步执行。异步的时候，会释放锁，所以建议同步执行。
};
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
/**
 * 
 * 
 * 
 */

/**
 * 
 * 
 */
function* getUniqTag() {
    let tag = new ObjectID();
    return tag.toString();
}
module.exports.getUniqTag = async(getUniqTag);
/**
 * 
 */
module.exports.initAccessor = async(initAccessor);
module.exports.initLogAccessor = async(initLogAccessor);
module.exports.initCalcRuleAccessor = async(initCalcRuleAccessor);
module.exports.initTerminologyAccessor = async(initTerminologyAccessor);
module.exports.initRecordAccessor = async(initRecordAccessor);
module.exports.initIncubatorAccessor = async(initIncubatorAccessor);
module.exports.initPDCAccessor = async(initPDCAccessor);


function* initAccessor(accessor) {
    accessor.thisTag = yield getUniqTag();
    accessor.timemark.lastModifed = Date.now();
}

function* initPDCAccessor(accessor) {
    yield co(initAccessor(accessor));
    accessor.special.status = "OK"; //status: OK,COMPUTING,
}

function* initRecordAccessor(accessor) {
    yield co(initAccessor(accessor));
}

function* initLogAccessor(accessor) {
    yield co(initAccessor(accessor));
    accessor.special = { logLevel: 7 };
}

function* initCalcRuleAccessor(accessor) {
    yield co(initAccessor(accessor));
}

function* initTerminologyAccessor(accessor) {
    yield co(initAccessor(accessor));
}

function* initIncubatorAccessor(accessor) {
    yield co(initAccessor(accessor));
}



/**
 * 
 * @param {*} modelName 访问控制块mongoose model 名。
 * @param {*} accessorID 
 * @param {*} context 
 */

//访问器 有并发访问器，安全访问器，跟踪访问器等等。
function* createAccessorToken() {
    var token = new ObjectID();
    return token.toString();
}

function* isTagEqual(tagA, tagB) {
    return tagA === tagB;
};
/**
 * 并发
 */

module.exports.holdLockAndOperWithAssertWithThrow = async(holdLockAndOperWithAssertWithThrow);

function* holdLockAndOperWithAssertWithThrow(holdAccessorTag, oper, context) { //调整到db.manager作为通用锁访问，相应的组件有access{}；schema支持继承么？
    //参数调整
    var accessor = yield Accessor.findOne({ thisTag: holdAccessorTag, version: sysConfig.version }, { thisTag: 1, concurrent: 1 });
    if (!accessor) {
        var err = {
            no: exceptionMgr.accessorNotExistException,
            contex: {
                accessor: accessorTag,
                level: 7
            }
        };
        throw (err);
    }
    if (!_.isFunction(oper)) {
        var err = { no: exceptionMgr.notFunctionException, context: { function: oper.toString(), level: 7 } };
        throw (err);
    }
    if (!context) { context = {}; };
    context = _.defaults(context, defaultHoldOptions);
    //
    if (!context.$_startTime) { context.$_startTime = new Date() }; //计时
    if (!context.$_accessToken) {
        context.$_accessToken = yield createAccessorToken(); //新建随机accesstag，为防止死锁，需要考虑按规则强行释放。
    }
    //
    if (accessor.concurrent.token && accessor.concurrent.token === context.$_accessToken) { //重入
        return yield doOper();
    } else if (accessor.concurrent.token && accessor.concurrent.token !== context.$_accessToken) {
        var now = new Date();
        if (now.getTime() - context.$_startTime.getTime() > context.maxLagTime) {
            var err = { no: exceptionMgr.holdAccessorException, context: { accessor: holdAccessorTag, level: 3 } };
            throw (err);
        } //操作失败。
        else { //尝试随机时间后，再尝试修改
            yield pauseAndRehold(); //0.5秒以内，重新尝试一次。
        }
    } else if (!accessor.concurrent.token) {
        accessor.concurrent.token = context.$_accessToken;
        accessor.markModified("concurrent.token");
        yield accessor.save();
        //重新查找一次，确认目前是自己占用了锁。
        accessor = yield Accessor.findOne({ thisTag: holdAccessorTag, version: sysConfig.version }, { thisTag: 1, concurrent: 1 });
        if (accessor.concurrent.token !== context.$_accessToken) {
            var now = new Date();
            if (now.getTime() - context.$_startTime.getTime() > context.maxLagTime) {
                var err = { no: exceptionMgr.holdAccessorException, context: { accessor: holdAccessorTag, level: 3 } }; //正常异常
                throw (err);
            } //操作失败。
            else { //尝试随机时间后，再尝试修改
                yield pauseAndRehold(); //0.5秒以内，重新尝试一次。
            }

        } else {
            return yield doOper();

        }
    };

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
                yield co(holdLockAndOper(holdAccessorTag, oper, context));
                resolve(randomPauseTime);
            });
        });
        return promise;
    };

    function doOper() {
        var promise = new Promise(function(resolve, reject) {
            co(function*() {
                try { //注意：no more return ;会重复激发finally
                    if (context.$_async) {
                        return oper(context);
                    } else {
                        return yield oper(context);
                    }

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
    }; //end doOper


}


/**
 * 
 * accessor 操作
 */
module.exports.accessor = {
    isProtoOf: async(isProtoOf),
    assertAccessorExist: async(assertAccessorExist),
    updateAccessorOnlySpecial: async(updateAccessorOnlySpecial),
    getAccessorOnlySpecialEditable: async(getAccessorOnlySpecialEditableWithAssertWithThrow),
    getAccessorOnlySpecialInEditable: async(getAccessorOnlySpecialInEditableWithAssertWithThrow),
    getAccessorOnlyProtoEditable: async(getAccessorOnlyProtoEditableWithAssertWithThrow),
    getAccessorOnlyProtoInEditable: async(getAccessorOnlyProtoInEditableWithAssertWithThrow),


};


function* isProtoOf(protoAccessorTag, accessorTag) {

    var accessor = yield Accessor.findOne({ thisTag: accessorTag, version: sysConfig.version }, { thisTag: 1, "proto.forward": 1 });
    if (!accessor) {
        return false;
    }
    if (!accessor.proto.forward) {
        return false;
    } else {
        if (yield isTagEqual(accessor.proto.forward, protoAccessorTag)) {
            return true;
        }
        var forwardAccessor = yield Accessor.findOne({ thisTag: accessor.proto.forward, version: sysConfig.version });
        return yield isProtoOf(protoAccessorTag, forwardAccessor.thisTag);
    }
};
//

function* assertAccessorExist(accessorTag) {
    const accessor = yield Accessor.findOne({ thisTag: incubatorAccessorTag, version: sysConfig.version }, { thisTag: 1 });
    if (!accessor) {
        var err = {
            no: exceptionMgr.accessorNotExistException,
            contex: {
                accessor: accessorTag,
                level: 7
            }
        };
        throw (err);
    };
};
//

function* updateAccessorOnlySpecial(accessorEditable, specialObject) {
    assert(accessorEditable._id, `accessor=${accessorEditable.thisTag} must be editable.`)
    accessorEditable.special = specialObject;
    accessorEditable.markModified("special");
    yield accessorEditable.save();
    return accessorEditable;
};
//

function* getAccessorOnlySpecialEditableWithAssertWithThrow(accessorTag) {
    var accessor = yield Accessor.findOne({ thisTag: accessorTag, version: sysConfig.version }, { thisTag: 1, special: 1 });
    if (!accessor) {
        var err = {
            no: exceptionMgr.accessorNotExistException,
            contex: {
                accessor: accessorTag,
                level: 7
            }
        };
        throw (err);
    }
    return accessor;
};

function* getAccessorOnlySpecialInEditableWithAssertWithThrow(accessorTag) {
    var accessor = yield getAccessorOnlySpecialEditableWithAssertWithThrow(accessorTag);
    var po = accessor.toObject();
    return delete po._id;
}

/**
 * 
 */

function* getAccessorOnlyProtoEditableWithAssertWithThrow(accessorTag) {
    var accessor = yield Accessor.findOne({ thisTag: accessorTag, version: sysConfig.version }, { thisTag: 1, "proto.forward": 1 });
    if (!accessor) {
        var err = {
            no: exceptionMgr.accessorNotExistException,
            contex: {
                accessor: accessorTag,
                level: 7
            }
        };
        throw (err);
    }
    return accessor;
};

// function* getAccessorOnlyProtoEditableWithAssertWithoutThrow(accessorTag) {
//     try {
//         var accessor = yield getAccessorOnlyProtoEditableWithAssertWithThrow(accessorTag);
//         return accessor;
//     } catch (e) {
//         if (e.no === exceptionMgr.accessorNotExistException) {
//             return null;
//         } else {
//             throw (e);
//         }
//     }

// };
//

function* getAccessorOnlyProtoInEditableWithAssertWithThrow(accessorTag) {
    var accessor = yield getAccessorOnlyProtoEditableWithAssertWithThrow(accessorTag);
    return delete accessor._id;
};

// function* getAccessorOnlyProtoWithAssertWithoutThrow(accessorTag) {
//     try {
//         var accessor = yield getAccessorOnlyProtoWithAssertWithThrow(accessorTag);
//         return accessor;
//     } catch (e) {
//         if (e.no === exceptionMgr.accessorNotExistException) {
//             return null;
//         } else {
//             throw (e);
//         }
//     }
// };
/**
 * 
 * 
 * pdcItem
 */

module.exports.PDCItem = {
    getPDCItemCoreEditable = async(getPDCItemCoreEditableWithAssertWithThrow),
    getPDCItemCoreEditableWithAssertWithThrow: async(getPDCItemCoreEditableWithAssertWithThrow),
    getPDCItemcoreInEditable: async(getPDCItemCoreInEditableWithAssertWithThrow),
    getPDCItemCoreInEditableWithAssertWithThrow: async(getPDCItemCoreInEditableWithAssertWithThrow),
    getNewPDCItemEditable: async(getNewPDCItemEditable)
}

function* getNewPDCItemEditable() {
    var newPDCItem = new PDCItem();
    return newPDCItem;
}

function* getPDCItemCoreEditableWithAssertWithThrow(pdcAccessorTag, ruleName) {
    yield assertAccessorExist(pdcAccessorTag);
    var pdcItem = yield PDCItem.findOne({ "tracer.ownerTag": pdcAccessorTag, name: ruleName }, {
        "tracer.ownerTag": 1,
        name: 1,
        applyRecalc: 1,
        value: 1
    });
    if (!pdcItem) {
        return null;
    }
    return pdcItem;

};


function* getPDCItemCoreInEditableWithAssertWithThrow(pdcAccessorTag, ruleName) {
    var pdcItem = yield getPDCItemCoreEditable(pdcAccessorTag, ruleName);
    if (pdcItem) {
        return delete pdcItem._id;
    }
    return null;

}

/**
 * 
 * 
 */


/**
 * 
 * incubator
 */
module.exports.incubator = {
    getIncubatorCoreEditable = async(getIncubatorCoreEditableWithAssertWithThrow), //default
    getIncubatorCoreEditableWithAssertWithThrow = async(getIncubatorCoreEditableWithAssertWithThrow),
    //  getIncubatorCoreEditableWithAssertWithoutThrow = async(getIncubatorCoreEditableWithAssertWithoutThrow),
    getIncubatorCoreInEditable = async(getIncubatorCoreInEditableWithAssertWithThrow), //default
    getIncubatorCoreInEditableWithAssertWithThrow = async(getIncubatorCoreInEditableWithAssertWithThrow),
    //   getIncubatorCoreInEditableWithAssertWithoutThrow = async(getIncubatorCoreInEditableWithAssertWithoutThrow)

};

function* getIncubatorCoreEditableWithAssertWithThrow(inCubatorAccessorTag, incubatorName, context) {
    yield assertAccessorExist(inCubatorAccessorTag);
    var incubator = yield Incubator.findOne({ name: incubatorName, "tracer.ownerTag": inCubatorAccessorTag }, {
        "container.PDCAccessorTag": 1,
        "container.recordAccessorTag": 1,
        "strategy.calcRuleAccessorTag": 1
    });
    return incubator;
};

// function* getIncubatorCoreEditableWithAssertWithoutThrow(inCubatorAccessorTag, incubatorName) {
//     try {
//         var incubator = yield getIncubatorCoreEditableWithAssertWithThrow(inCubatorAccessorTag, incubatorName);
//         return incubator;
//     } catch (e) {
//         switch (e.no) {
//             default: return null;
//         }
//     }

// }

function* getIncubatorCoreInEditableWithAssertWithThrow(inCubatorAccessorTag, incubatorName) {
    var incubator = yield getIncubatorCoreEditableWithAssertWithThrow(inCubatorAccessorTag, incubatorName);
    if (!incubator) {
        var err = { no: exceptionMgr.incubatorNotExistException, context: { incubator: incubatorName, level: 7 } };
        throw (err);
    }
    var po = incubator.toObject();
    return delete po._id;


};

// getIncubatorCoreInEditableWithAssertWithoutThrow(inCubatorAccessorTag, incubatorName) {
//     try {
//         var incubator = yield getIncubatorCoreInEditableWithAssertWithThrow(inCubatorAccessorTag, incubatorName);
//         return incubator;
//     } catch (e) {
//         switch (e.no) { //do someting like log
//             default: return null;
//         }

//     }
// };
/**
 * 
 * ruleDescriptor
 */

module.exports.ruleDescriptor = {
    getRuleDescriptorCoreEditable = async(getRuleDescriptorCoreEditableWithAssertWithThrow), //default
    getRuleDescriptorCoreEditableWithAssertWithThrow: async(getRuleDescriptorCoreEditableWithAssertWithThrow),
    //  getRuleDescriptorCoreEditableWithAssertWithoutThrow: async(getRuleDescriptorCoreEditableWithAssertWithoutThrow),
    //
    getRuleDescriptorCoreInEdiatable = async(getRuleDescriptorCoreInEditableWithAssertWithThrow), //default 
    getRuleDescriptorCoreInEditableWithAssertWithThrow: async(getRuleDescriptorCoreInEditableWithAssertWithThrow),
    // getRuleDescriptorCoreInEditableWithAssertWithoutThrow: async(getRuleDescriptorCoreInEditableWithAssertWithoutThrow)
};

function* ruleDescriptorCore(ruleAccessorTag, ruleName) {
    return yield CalcRuleDescriptor.findOne({ "tracer.ownerTag": ruleAccessorTag, name: ruleName }, {
        "tracer.ownerTag": 1,
        name: 1,
        "tracer.updatedTime": 1,
        "rule.bases": 1
    });
}


function* getRuleDescriptorCoreEditableWithAssertWithThrow(ruleAccessorTag, ruleName) {
    var calcRuleAccessor = yield getAccessorOnlyProtoWithAssertWithoutThrow(calcRuleAccessorTag);
    if (!calcRuleAccessor) {
        var err = {
            no: exceptionMgr.ruleNotExistException,
            context: { rule: ruleName, accessor: calcRuleAccessorTag, level: 7 }
        };
        throw (err);
    }
    var ruleDesCore = null;
    while (calcRuleAccessor) {
        let ownerTag = calcRuleAccessor.thisTag;
        let sourceAccessorTag = calcRuleAccessor.proto.forward;

        ruleDesCore = yield ruleDescriptorCore(ownerTag, ruleName);

        if (!ruleDes) {
            calcRuleAccessor = yield getAccessorOnlyProtoWithAssertWithoutThrow(sourceAccessorTag);
            continue;
        }
        break;
    }
    if (ruleDesCore) {
        return ruleDesCore;
    } else {
        var err = {
            no: exceptionMgr.ruleNotExistException,
            context: { rule: ruleName, accessor: calcRuleAccessorTag, level: 7 }
        };
        throw (err);
    }
};

// function* getRuleDescriptorCoreEditableWithAssertWithoutThrow(ruleAccessorTag, ruleName) {
//     try {
//         var ruleDesc = yield getRuleDescriptorCoreEditableWithAssertWithThrow(ruleAccessorTag, ruleName);
//     } catch (e) {
//         switch (e.no) {
//             case exceptionMgr.accessorNotExistException:
//             case exceptionMgr.ruleNotExistException:
//                 //do someting.
//                 return null;
//                 break;
//             default:
//                 return null;
//         }
//     }
// };

function* getRuleDescriptorCoreInEditableWithAssertWithThrow(ruleAccessorTag, ruleName) {
    var ruleDesc = getRuleDescriptorCoreEditableWithAssertWithThrow(ruleAccessorTag, ruleName);
    if (!ruleDesc) {
        return null;
    }
    return delete ruleDesc._id;
};

// function* getRuleDescriptorCoreInEditableWithAssertWithoutThrow(ruleAccessorTag, ruleName) {
//     try {
//         var ruleDesc = yield getRuleDescriptorCoreInEditableWithAssertWithThrow(ruleAccessorTag, ruleName);
//         return ruleDesc;
//     } catch (e) {
//         switch (e.no) {
//             default: return null;
//         }

//     }


// }