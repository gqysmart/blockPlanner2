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

const sysConfig = require("../config/sys");
const version = sysConfig.version;
const exceptionMgr = require("./exception.manager.server");
//model
const Accessor = mongoose.model("Accessor");
const RuleDescriptor = mongoose.model("CalcRuleDescriptor");
const PDCStatus = mongoose.model("PDCStatus");
const Terminology = mongoose.model("Terminology");
const Record = mongoose.model("Record");
const Incubator = mongoose.model("Incubator");
const InitConfig = mongoose.model("InitConfig");




//
const defaultHoldOptions = {
    $_maxLagTime: 3000, //3秒
    $_async: false //同步执行，还是异步执行。异步的时候，会释放锁，所以建议同步执行。
};
//初始化所有mongoose model

const sysinitedCfgCriteria = { name: "systemInited", category: "system", version: version };
const rootCalcRuleAccessorTagCfgCriteria = { name: "rootCalcRuleAccessorTag", category: "system", version: version };
const rootAccessorTagCfgCriteria = { name: "rootAccessorTag", category: "system", version: version };

const terminologyAccessorTagCfgCriteria = { name: "terminologyAccessorTag", category: "system", version: version };
const systemLogAccessorTagCfgCriteria = { name: "systemLogAccessorTag", category: "system", version: version };
module.exports.rootAccessorTagCfgCriteria = (function() {
    var criteria = {};
    _.defaults(criteria, rootAccessorTagCfgCriteria);
    return criteria; //防止污染
})();
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
    accessor.category = "PDC"; //status: OK,COMPUTING,
    accessor.special = { maxPDC: 10 };
}

function* initRecordAccessor(accessor) {
    yield co(initAccessor(accessor));
    accessor.category = "RECORD"; //status: OK,COMPUTING,

}



function* initLogAccessor(accessor) {
    yield co(initAccessor(accessor));
    accessor.category = "LOG"; //status: OK,COMPUTING,
    accessor.special = { logLevel: 7 };
}

function* initCalcRuleAccessor(accessor) {
    yield co(initAccessor(accessor));
    accessor.category = "RULE"; //status: OK,COMPUTING,

}

function* initTerminologyAccessor(accessor) {
    yield co(initAccessor(accessor));
    accessor.category = "TERMINOLOGY"; //status: OK,COMPUTING,

}

function* initIncubatorAccessor(accessor) {
    yield co(initAccessor(accessor));
    accessor.category = "INCUBATOR"; //status: OK,COMPUTING,

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
    var holdedAccessor = null;
    try {
        holdedAccessor = yield doHoldAccessor(holdAccessorTag, oper, context);
        console.log(holdedAccessor.concurrent + "g" + context.$_accessToken);
        var result = yield doOper(holdedAccessor);
        return result;
        if (result === null) {
            console.log("wrong");
        }

    } catch (e) { //超时。
        switch (e.no) {
            case exceptionMgr.holdAccessorException:
                return null;
                break;
            default:
                throw e;
        }
    } finally {

    }

    function doOper(holdedAccessor) {
        var promise = new Promise(function(resolve, reject) {
            co(function*() {
                var result = null;
                try { //注意：no more return ;会重复激发finally
                    if (context.$_async) {
                        return oper(context);
                    } else {
                        result = yield oper(context);
                    }

                } catch (e) {
                    throw (e);

                } finally {
                    holdedAccessor.concurrent.token = "";
                    yield holdedAccessor.save();
                    resolve(result);
                }
            });
        });
        return promise;
    }; //end doOper
    function* doHoldAccessor(holdAccessorTag, oper, context) {
        var accessor = yield getAccessorEditableOnlyConcurrentWithThrow(holdAccessorTag);
        if (accessor.concurrent.token && accessor.concurrent.token === context.$_accessToken) { //重入
            return accessor;
        } else if (accessor.concurrent.token && accessor.concurrent.token !== context.$_accessToken) {
            var now = new Date();
            if (now.getTime() - context.$_startTime.getTime() > context.maxLagTime) {
                var err = { no: exceptionMgr.holdAccessorException, context: { accessor: holdAccessorTag, level: 3 } };
                throw (err);
            } //操作失败。
            else { //尝试随机时间后，再尝试修改
                var randomPauseTime = Math.random() * 500;
                yield pause(randomPauseTime);
                var result = yield doHoldAccessor(holdAccessorTag, oper, context); //0.5秒以内，重新尝试一次。
                return result;
            }
        } else if (!accessor.concurrent.token) {
            accessor.concurrent.token = context.$_accessToken;
            accessor.markModified("concurrent.token");
            yield accessor.save();
            //重新查找一次，确认目前是自己占用了锁。
            accessor = yield getAccessorEditableOnlyConcurrentWithThrow(holdAccessorTag);
            if (accessor.concurrent.token !== context.$_accessToken) {
                var now = new Date();
                if (now.getTime() - context.$_startTime.getTime() > context.maxLagTime) {
                    var err = { no: exceptionMgr.holdAccessorException, context: { accessor: holdAccessorTag, level: 3 } }; //正常异常
                    throw (err);
                } //操作失败。
                else { //尝试随机时间后，再尝试修改
                    var randomPauseTime = Math.random() * 500;
                    yield pause(randomPauseTime);
                    var result = yield doHoldAccessor(holdAccessorTag, oper, context);
                    return result;
                    //0.5秒以内，重新尝试一次。
                }

            } else {
                return accessor;
            }
        };

    };

    function pause(miliseconds) {
        var promise = new Promise(function(resolve, reject) {
            setTimeout(function() { resolve(miliseconds) }, miliseconds);
        });
        return promise;
    };


}


/**
 * 
 * accessor 操作
 */
module.exports.accessor = {
    isProtoOf: async(isProtoOf),
    assertAccessorExist: async(assertAccessorExist),
    updateAccessorOnlySpecial: async(updateAccessorOnlySpecial),
    //   getAccessorOnlySpecialEditable: async(getAccessorOnlySpecialEditableWithAssertWithThrow),
    getAccessorOnlySpecialInEditable: async(getAccessorOnlySpecialInEditableWithAssertWithThrow),
    // getAccessorOnlyProtoEditable: async(getAccessorEditableOnlyProtoWithAssertWithThrow),
    // getAccessorOnlyProtoInEditable: async(getAccessorInEditableOnlyProtoWithAssertWithThrow),
    // itemsCountInAccessor: async(itemsCountInAccessor), //查询条件个数
    // keepItemsCountInAccessorBelow: async(keepItemsCountInAccessorBelow), //items不大于
    firstNItemEditableInAccessor: async(firstNItemEditableInAccessor),
    // newItemEditableInAccessor: async(newItemEditableInAccessor)

};



/**
 *accessor查询 
 *
 */
function* getAccessorEditableOnlyCategoryWithoutAssert(accessorTag) {
    const accessor = yield Accessor.findOne({ thisTag: accessorTag, version: sysConfig.version }, { thisTag: 1, category: 1 });
    return accessor;
};



//return itemreference
function* firstNItemEditableInAccessor(accessorTag, num, sort, criteria) {
    var accessor = yield getAccessorEditableOnlyCategoryWithoutAssert(accessorTag);
    if (!accessor) {
        return null;
    }
    var itemModel = yield category2ModelWithThrow(accessor.category);
    if (itemModel) {
        var _criteria = { "tracer.ownerTag": accessorTag };
        _.defaults(_criteria, criteria);
        var items = yield itemModel.find(_criteria).sort(sort).limit(num).toArray();
        return items;

    } else {
        return null;
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

function* getAccessorOnlySpecialInEditableWithAssertWithThrow(accessorTag) {
    var accessor = yield getAccessorOnlySpecialEditableWithAssertWithThrow(accessorTag);
    var po = accessor.toObject();
    delete po._id;
    return po;
}

/**
 * 
 */



// function* getAccessorOnlyProtoEditableWithAssertWithoutThrow(accessorTag) {
//     try {
//         var accessor = yield getAccessorEditableOnlyProtoWithAssertWithThrow(accessorTag);
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

function* getAccessorInEditableOnlyProtoWithAssertWithThrow(accessorTag) {
    var accessor = yield getAccessorEditableOnlyProtoWithAssertWithThrow(accessorTag);
    delete accessor._id;
    return accessor;
};


/**
 * 
 * incubator
 */
module.exports.incubator = {
    getIncubatorCoreEditable: async(getIncubatorCoreEditableWithAssertWithThrow), //default
    getIncubatorCoreEditableWithAssertWithThrow: async(getIncubatorCoreEditableWithAssertWithThrow),
    //  getIncubatorCoreEditableWithAssertWithoutThrow = async(getIncubatorCoreEditableWithAssertWithoutThrow),
    getIncubatorCoreInEditable: async(getIncubatorCoreInEditableWithAssertWithThrow), //default
    getIncubatorCoreInEditableWithAssertWithThrow: async(getIncubatorCoreInEditableWithAssertWithThrow),
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
    delete po._id;
    return po;


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
    // getRuleDescriptorCoreEditable: async(getRuleDescriptorCoreEditableWithAssertWithThrow), //default
    // getRuleDescriptorCoreEditableWithAssertWithThrow: async(getRuleDescriptorCoreEditableWithAssertWithThrow),
    //  getRuleDescriptorCoreEditableWithAssertWithoutThrow: async(getRuleDescriptorCoreEditableWithAssertWithoutThrow),
    //
    getRuleDescriptorCoreInEditable: async(getRuleDescriptorCoreInEditableWithAssertWithThrow), //default 
    getRuleDescriptorCoreInEditableWithAssertWithThrow: async(getRuleDescriptorCoreInEditableWithAssertWithThrow),
    // getRuleDescriptorCoreInEditableWithAssertWithoutThrow: async(getRuleDescriptorCoreInEditableWithAssertWithoutThrow)
};





function* getRuleDescriptorCoreInEditableWithAssertWithThrow(ruleAccessorTag, ruleName) {
    var ruleDesc = yield getRuleDescriptorCoreEditableWithAssertWithThrow(ruleAccessorTag, ruleName);
    if (!ruleDesc) {
        return null;
    }
    delete ruleDesc._id;
    return ruleDesc;
};


function* assertAccessorExist(accessorTag) {
    const accessor = yield Accessor.findOne({ thisTag: accessorTag, version: sysConfig.version }, { thisTag: 1 });
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
/**
 * 
 * @param {*} protoAccessorTag 
 * @param {*} accessorTag 
 */
//refactory
function* isProtoOf(protoAccessorTag, accessorTag) {
    try {
        return yield(accessorTag);
    } catch (e) {
        return false;
    }

    function* _doCompareProto(_accessorTag) {
        var accessor = yield getAccessorEditableOnlyProtoWithThrow(_accessorTag);
        if (!accessor.proto || !accessor.proto.forward) {
            return false;
        }
        if (accessor.proto.forward === protoAccessorTag) {
            return true;
        } else {
            return yield _doCompareProto(accessor.proto.forward);

        }
    };

};


function* category2ModelWithThrow(category) {
    var itemModel = null;
    switch (category) {
        case "PDC":
            itemModel = PDCStatus;
            break;
        case "RECORD":
            itemModel = Record;
            break;
        case "RULE":
            itemModel = RuleDescriptor;
            break;
        case "TERMINOLOGY":
            itemModel = Terminology;
            break;
        case "INCUBATOR":
            itemModel = Incubator;
            break;
        default:
            {
                var err = { no: exceptionMgr.modelNotExist, context: { category: category, level: 7 } };
                throw err;
            }

    }
    return itemModel;
};

function* getAccessorEditableOnlyCategoryWithThrow(accessorTag) {
    const accessor = yield Accessor.findOne({ thisTag: accessorTag, version: sysConfig.version }, { thisTag: 1, category: 1 });
    if (!accessor) {
        var err = {
            no: exceptionMgr.accessorNotExistException,
            contex: {
                accessor: accessorTag,
                level: 7
            }
        };
        throw err;
    }
    return accessor;
}

function* getAccessorEditableOnlySpecialWithThrow(accessorTag) {

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

function* getAccessorEditableOnlyConcurrentWithThrow(accessorTag) {

    var accessor = yield Accessor.findOne({ thisTag: accessorTag, version: sysConfig.version }, { thisTag: 1, concurrent: 1 });
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

function* firstNSortedItemsCoreEditableInAccessorWithThrow(accessorTag, criteria, num, sort) {
    var accessor = yield getAccessorEditableOnlyCategoryWithThrow(accessorTag);
    var itemModel = yield category2ModelWithThrow(accessor.category);

    var _coreProject = itemModel.coreProject;
    var _criteria = { "tracer.ownerTag": accessorTag };
    _.defaults(_criteria, criteria);

    var _num = 1;
    if (num) {
        _num = num;
    }
    var _sort = {};
    _.defaults(_sort, sort);
    //
    var items = yield itemModel.find(_criteria, _coreProject).sort(_sort).limit(_num);
    return items;

};
//return existNum;
function* keepItemsCountInAccessorBelowWithThrow(accessorTag, criteria, maxNums, sort) {
    var accessor = yield getAccessorEditableOnlyCategoryWithThrow(accessorTag);
    var itemModel = yield category2ModelWithThrow(accessor.category);

    var _criteria = { "tracer.ownerTag": accessorTag };
    _.defaults(_criteria, criteria);
    var existNums = yield itemModel.find(_criteria).count();
    if (existNums > maxNums) {
        var invalidItemsNums = existNums - nums;
        var invalidItems = yield itemModel.find(_criteria, { _id: 1 }).sort(sort).limit(invalidRecordsNums).exec();
        //
        yield itemModel.remove(invalidItems);
        return maxNums;
    } else {
        return existNums;
    }

};

function* itemsCountInAccessorWithThrow(accessorTag, criteria) {
    var accessor = yield getAccessorEditableOnlyCategoryWithoutAssert(accessorTag);
    var itemModel = yield category2ModelWithThrow(accessor.category);

    var _criteria = { "tracer.ownerTag": accessorTag };
    _.defaults(_criteria, criteria);
    return yield itemModel.find(_criteria).count();
};


function* newItemEditableInAccessorWithThrow(accessorTag) {
    var accessor = yield getAccessorEditableOnlyCategoryWithThrow(accessorTag);

    var itemModel = yield category2ModelWithThrow(accessor.category);
    var newItem = new itemModel({ "tracer.ownerTag": accessorTag });
    return newItem;

};

function* getAccessorEditableOnlyProtoAndCategoryWithThrow(accessorTag) {
    var accessor = yield Accessor.findOne({ thisTag: accessorTag, version: sysConfig.version }, { thisTag: 1, "proto.forward": 1, "category": 1 });
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

function* getAccessorEditableOnlyProtoWithThrow(accessorTag) {
    var accessor = yield Accessor.findOne({ thisTag: accessorTag, version: sysConfig.version }, { thisTag: 1, "proto.forward": 1, "proto.writeOnCopy": 1 });
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

function* copyAllFromAccessorTo(fromAccessorTag, toAccessorTag, criteria, project) {
    var fromAccessor = yield getAccessorEditableOnlyCategoryWithThrow(fromAccessorTag);
    var itemModel = yield category2ModelWithThrow(accessor.category);
    var _criteria = { "tracer.ownerTag": fromAccessorTag };
    _.defaults(_criteria, criteria);
    var _project = { _id: 0 };
    _.defaults(_project, project);
    var newItems = yield itemModel.find(_criteria, _project).exec();
    yield itemModel.insertMany(newItems);
    yield itemModel.update(newItems, { $set: { "tracer.ownerTag": toAccessorTag } });
};

function* theOneItemCoreReadOnlyInProtoAccessorWithThrow(accessorTag, criteria) {
    var rootAccessor = yield getAccessorEditableOnlyCategoryWithThrow(accessorTag);
    var itemModel = yield category2ModelWithThrow(rootAccessor.category);
    var coreProject = itemModel.coreProject;
    var _coreProject = { _id: 0 }; //readonly
    var resultItem = yield _doQueryInProtoChain(accessorTag);
    if (resultItem) {
        if (resultItem.tracer) { //防止泄露原型信息。
            resultItem.tracer.ownerTag = accessorTag;
        } else {
            resultItem.tracer = { ownerTag: accessorTag };
        }
    }
    return resultItem;


    function* _doQueryInProtoChain(_accessorTag) {
        var _criteria = { "tracer.ownerTag": _accessorTag };
        _.defaults(_criteria, criteria);
        var item = yield itemModel.findOne(_criteria, _coreProject);
        if (!item) {
            var accessorWithProto = yield getAccessorEditableOnlyProtoWithThrow(_accessorTag);
            if (!accessorWithProto.proto || !accessorWithProto.proto.forward) {
                return null;
            } else {
                return yield _doQueryInProtoChain(accessorWithProto.proto.forward)
            }
        }
        return item;
    };
};

function* theOneItemEditableInAccessorWithThrow(accessorTag, criteria, project) {
    var accessor = yield getAccessorEditableOnlyCategoryWithThrow(accessorTag);
    var itemModel = yield category2ModelWithThrow(accessor.category);
    var _project = { id: 1 }; //防止被污染
    _.defaults(_project, project);
    var _criteria = { "tracer.ownerTag": accessorTag };
    _.defaults(_criteria, criteria);
    var resultItem = yield itemModel.findOne(_criteria, _project);;
    return resultItem;
};

function* collapse2Proto(accessorTag, protoAccessorTag) {
    if (!protoAccessorTag) { //默认为到rootaccessor。
        var rootAccessorTagCfg = yield InitConfig.findOne(rootAccessorTagCfgCriteria);
        protoAccessorTag = rootAccessorTagCfg.value;
        //除自己外，将原型链上的所有accessor，标记为writeoncopy

    } else {
        var isInChain = yield isProtoOf(protoAccessorTag, accessorTag);
        if (!isInChain) {
            return; //不做修改
        }
    }
    var accessor = yield getAccessorEditableOnlyProtoWithThrow(accessorTag);
    return yield _doSetWriteOnCopyOnProto(accessor.proto.forward);


    function* _doSetWriteOnCopyOnProto(_accessorTag) {
        var _accessor = yield getAccessorEditableOnlyProtoWithThrow(_accessorTag);
        if (!_accessor.proto || !_accessor.proto.forward) {
            return; //root accessor
        }
        _accessor.proto.writeOnCopy = true;
        yield _accessor.save();
        yield _doSetWriteOnCopyOnProto(_accessor.proto.forward);

    };

};

//return a new accessor
//垃圾收集，没有forward指向的，或是自己没有指向别人的，都是垃圾，定时收集。

function* addItemInAccessorWithThrow(accessorTag, item) { //complicated.  //update，add  删除规则是没有必要且不允许的。
    if (item._id) { //不允许通过id修改
        var err = { no: exceptionMgr.parameterException, context: { parameter: item } };
        throw err;
    }

    var accessor = yield getAccessorEditableOnlyProtoWithThrow(accessorTag);
    var copyOnWrite = accessor.proto.copyOnWrite;
    if (copyOnWrite) {
        var copyedAccessor = yield newAccessorEditable(accessor.category, accessor.proto.forward); //copyedAccessor's copyonWrite is null or false;
        yield copyedAccessor.save();
        yield copyAllFromAccessorTo(accessorTag, copyedAccessor.thisTag);

        var itemInAccessor = yield newItemEditableInAccessorWithThrow(copyedAccessor.thisTag);
        for (key in item) {
            if (Object.prototype.hasOwnProperty.apply(item, key)) { //防止item被污染
                itemInAccessor[key] = item.key;
            }
        }
        yield itemInAccessor.save();
        return copyedAccessor.thisTag; //返回新的accessorTag

    } else {

        var itemInAccessor = yield newItemEditableInAccessorWithThrow(accessorTag);

        //应用时，按需加锁修改，添加。unsafety.
        for (key in item) {
            if (key !== "_id" && Object.prototype.hasOwnProperty.call(item, key)) { //防止item被污染
                itemInAccessor[key] = item[key];
            }
        }
        yield itemInAccessor.save();
        return accessor.thisTag;
    }



};

function* updateItemInAccessorWithThrow(accessorTag, criteria, item) { //complicated.  //update，add  删除规则是没有必要且不允许的。
    if (item._id) { //不允许通过id修改
        var err = { no: exceptionMgr.parameterException, context: { parameter: item } };
        throw err;
    }

    var accessor = yield getAccessorEditableOnlyProtoWithThrow(accessorTag);
    var copyOnWrite = accessor.proto.copyOnWrite;
    if (copyOnWrite) {
        var copyedAccessor = yield newAccessorEditable(accessor.category, accessor.proto.forward); //copyedAccessor's copyonWrite is null or false;
        yield copyedAccessor.save();
        yield copyAllFromAccessorTo(accessorTag, copyedAccessor.thisTag);

        var itemInAccessor = yield theOneItemEditableInAccessorWithThrow(copyedAccessor.thisTag, criteria); //不在原型中
        if (!itemInAccessor) { //添加新的item
            itemInAccessor = yield newItemEditableInAccessorWithThrow(copyedAccessor.thisTag);
        }

        for (key in item) {
            if (Object.prototype.hasOwnProperty.apply(item, key)) { //防止item被污染
                itemInAccessor[key] = item.key;
            }
        }
        itemInAccessor.save();
        return copyedAccessor.thisTag; //返回新的accessorTag

    } else {

        var itemInAccessor = yield theOneItemEditableInAccessorWithThrow(accessorTag, criteria);
        if (!itemInAccessor) { //添加新的item
            itemInAccessor = yield newItemEditableInAccessorWithThrow(accessorTag);
        }

        //应用时，按需加锁修改，添加。unsafety.
        for (key in item) {
            if (key !== "_id" && Object.prototype.hasOwnProperty.apply(item, key)) { //防止item被污染
                itemInAccessor[key] = item.key;
            }
        }
        itemInAccessor.save();
        return accessor.thisTag;
    }



};

function* newNullAccessorEditable() {
    var accessor = new Accessor();
    yield initAccessor(accessor);
    return accessor;
};

function* newAccessorEditable(category, protoAccessorTag) {
    if (!protoAccessorTag) {
        var rootAccessorTagCfg = yield InitConfig.findOne(rootAccessorTagCfgCriteria);
        protoAccessorTag = rootAccessorTagCfg.value;
    }
    var _category = category;
    if (_.isFunction(category)) {
        _category = category();
    };
    var newAccessor = new Accessor();
    newAccessor.proto.forward = protoAccessorTag; //产生原型链
    switch (_category) {
        case "PDC":
            yield initPDCAccessor(newAccessor);
            break;
        case "RECORD":
            yield initRecordAccessor(newAccessor);
            break;
        case "RULE":
            yield initCalcRuleAccessor(newAccessor);
            break;
        case "TERMINOLOGY":
            yield initTerminologyAccessor(newAccessor);
            break;
        case "INCUBATOR":
            yield initIncubatorAccessor(newAccessor);
            break;
        default:
            return null;
    }
    return newAccessor;

};
//
module.exports.firstNSortedItemsCoreEditableInAccessorWithThrow = async(firstNSortedItemsCoreEditableInAccessorWithThrow);
module.exports.getAccessorEditableOnlySpecialWithThrow = async(getAccessorEditableOnlySpecialWithThrow);
module.exports.getAccessorEditableOnlyProtoWithThrow = async(getAccessorEditableOnlyProtoWithThrow);
module.exports.itemsCountInAccessorWithThrow = async(itemsCountInAccessorWithThrow);
module.exports.keepItemsCountInAccessorBelowWithThrow = async(keepItemsCountInAccessorBelowWithThrow);
module.exports.newItemEditableInAccessorWithThrow = async(newItemEditableInAccessorWithThrow);
module.exports.theOneItemCoreReadOnlyInProtoAccessorWithThrow = async(theOneItemCoreReadOnlyInProtoAccessorWithThrow);
module.exports.theOneItemEditableInAccessorWithThrow = async(theOneItemEditableInAccessorWithThrow);
module.exports.newNullAccessor = async(newNullAccessorEditable);
module.exports.newAccessorEditable = async(newAccessorEditable);
module.exports.updateItemInAccessorWithThrow = async(updateItemInAccessorWithThrow);
module.exports.addItemInAccessorWithThrow = async(addItemInAccessorWithThrow);