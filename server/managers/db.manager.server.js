/**

/**
 * * Schema 的设计：
 * 要改一起改的，才需要放在一个对象里。否则，还是平坦化。不然更新没办法写$set.
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
const RuleDescriptor = mongoose.model("RuleDescriptor");
const PDCStatus = mongoose.model("PDCStatus");
const Terminology = mongoose.model("Terminology");
const Record = mongoose.model("Record");
const Incubator = mongoose.model("Incubator");
const InitConfig = mongoose.model("InitConfig");




//
const defaultHoldOptions = {
    $_maxLagTime: 30000, //3秒
    $_async: false //同步执行，还是异步执行。异步的时候，会释放锁，所以建议同步执行。
};
//初始化所有mongoose model

const sysinitedCfgCriteria = { name: "systemInited", category: "system", version: version };
const rootRuleAccessorTagCfgCriteria = { name: "rootRuleAccessorTag", category: "system", version: version };
const rootAccessorTagCfgCriteria = { name: "rootAccessorTag", category: "system", version: version };
const terminologyAccessorTagCfgCriteria = { name: "terminologyAccessorTag", category: "system", version: version };
const orgnizerAccessorTagCfgCriteria = { name: "orgnizerAccessorTag", category: "system", version: version };
const mainUserAccessorTagCfgCriteria = { name: "userAccessorTag", category: "system", version: version };
const systemLogAccessorTagCfgCriteria = { name: "systemLogAccessorTag", category: "system", version: version };
const mainInfoblockAccessorTagCfgCriteria = { name: "infoBlock", category: "system", version: version };
module.exports.mainInfoblockAccessorTagCfgCriteria = (function() {
    var criteria = {};
    _.defaults(criteria, mainInfoblockAccessorTagCfgCriteria);
    return criteria;
})();
module.exports.mainUserAccessorTagCfgCriteria = (function() {
    var criteria = {};
    _.defaults(criteria, mainUserAccessorTagCfgCriteria);
    return criteria; //防止污染
})();
module.exports.orgnizerAccessorTagCfgCriteria = (function() {
    var criteria = {};
    _.defaults(criteria, orgnizerAccessorTagCfgCriteria);
    return criteria; //防止污染
})();
module.exports.rootAccessorTagCfgCriteria = (function() {
    var criteria = {};
    _.defaults(criteria, rootAccessorTagCfgCriteria);
    return criteria; //防止污染
})();
module.exports.rootRuleAccessorTagCfgCriteria = (function() {
    var criteria = {};
    _.defaults(criteria, rootRuleAccessorTagCfgCriteria);
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


function* getUniqTag() {
    let tag = new ObjectID();
    return tag.toString();
}
module.exports.getUniqTag = async(getUniqTag);
/**
 * 
 */
//访问器 有并发访问器，安全访问器，跟踪访问器等等。
function* _createAccessorToken() {
    var token = new ObjectID();
    return token.toString();
}

function* _isTagEqual(tagA, tagB) {
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
        context.$_accessToken = yield _createAccessorToken(); //新建随机accesstag，为防止死锁，需要考虑按规则强行释放。
    }
    //
    var holdedAccessor = null;
    try {
        holdedAccessor = yield doHoldAccessor(holdAccessorTag, oper, context);
        var result = yield doOper(holdedAccessor);
        return result;


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
        var accessor = yield _getAccessorEditableOnlyConcurrentWithThrow(holdAccessorTag);
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
            accessor = yield _getAccessorEditableOnlyConcurrentWithThrow(holdAccessorTag);
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


};
/**
 * 
 * accessorItems
 */

module.exports.addItemsToAccessorWithThrow = async(_addItemsToAccessorWithThrow);
module.exports.addOneItemToAccessorWithThrow = async(_addOneItemToAccessorWithThrow);
module.exports.updateItemsInAccessorWithThrow = async(_updateItemsInAccessorWithThrow);
module.exports.theOneItemInAccessorWithThrow = async(_theOneItemInAccessorWithThrow);
module.exports.theOneItemAlongProtoToAccessorWithThrow = async(_theOneItemAlongProtoToAccessorWithThrow);
module.exports.itemsCountInAccessorWithThrow = async(_itemsCountInAccessorWithThrow);
module.exports.allItemsInAccessorWithThrow = async(_allItemsInAccessorWithThrow);
module.exports.allItemsFromAccessorToWithThrow = async(_allItemsFromAccessorToWithThrow);

function* _theOneItemAlongProtoToAccessorWithThrow(accessorTag, criteria, options) {
    if (!options) options = {};
    var returnFields = options.returnFields;
    var toAccesorTag = options.toAccesorTag;
    //
    var accessor = yield _getAccessorEditableOnlyCategoryWithThrow(accessorTag);
    var itemModel = yield _category2ModelWithThrow(accessor.category);
    var _criteria = { tracer: { ownerTag: accessorTag } };
    _.defaults(_criteria, criteria);
    var _project = { _id: 0 }; //防止泄露原型信息
    if (returnFields && _.isArray(returnFields)) {
        for (let i = 0; i < returnFields.length; i++) {
            //   if (returnFields[i] === "tracer.ownerTag" || returnFields[i] === "tracer") continue; //只有拥有accessorTag的，才有权利修改accessor中的内容，防止误修改。
            _project[returnFields[i]] = 1; //return,防止mixed project error
        }
    } else {;
    }
    //  _.defaults(_project, project);//mongoose不支持同时有0，1，需要转换，暂时不考虑。
    var result = yield _doQueryInProtoChain(accessorTag);
    if (result && result.tracer && result.tracer.ownerTag) {
        result.tracer.ownerTag = accessorTag; //防止泄露原型。
    }
    return result;

    function* _doQueryInProtoChain(accessorTag) {
        var accessorWithProto = yield _getAccessorEditableOnlyProtoWithThrow(accessorTag);
        if (!accessorWithProto.proto || !accessorWithProto.proto.forward) {
            return null;
        }

        _criteria.tracer.ownerTag = accessorTag; //修改查询对象
        if (accessorWithProto.proto.association) { //原型链已经专用了
            _criteria.tracer.ownerTag = accessorWithProto.proto.association;
        }
        var resultItem = yield itemModel.findOne(_criteria, _project);
        if (!resultItem) {
            if (accessorTag !== toAccesorTag) {
                return yield _doQueryInProtoChain(accessorWithProto.proto.forward);
            } else { return null; }
        }
        return resultItem;
    }
};

function* _allItemsInAccessorWithThrow(accessorTag, criteria, options) {
    if (!options) options = {};
    var returnFields = options.returnFields;
    var sort = options.sort;
    var limit = options.limit;
    var accessor = yield _getAccessorEditableOnlyCategoryWithThrow(accessorTag);
    var itemModel = yield _category2ModelWithThrow(accessor.category);
    var _criteria = { "tracer.ownerTag": accessorTag };
    _.defaults(_criteria, criteria);

    var _project = { _id: 0 }; //防止泄露原型信息
    if (returnFields && _.isArray(returnFields)) {
        for (let i = 0; i < returnFields.length; i++) {
            if (returnFields[i] === "tracer.ownerTag" || returnFields[i] === "tracer") continue; //只有拥有accessorTag的，才有权利修改accessor中的内容，防止误修改。
            _project[returnFields[i]] = 1; //return,防止mixed project error
        }
    } else {;
    }
    var items = yield itemModel.find(_criteria, _project).sort(sort).limit(limit).exec(); //不应返回promise或cursor，会有很多问题。
    return items;

}

function* _addItemsToAccessorWithThrow(accessorTag, items, options) { //complicated.  //update，add  删除规则是没有必要且不允许的。
    if (!options) options = {};
    var returnFields = options.returnFields;
    var needReturn = options.return;
    //
    var accessor = yield _getAccessorEditableOnlyProtoAndCategoryWithThrow(accessorTag);
    var copyOnWrite = accessor.proto.copyOnWrite;
    if (copyOnWrite) {
        yield _doCopyOnWrite(accessorTag);
    }
    var itemModel = yield _category2ModelWithThrow(accessor.category);
    var _update = { tracer: { ownerTag: accessorTag } };

    var resultItems = yield itemModel.insertMany(items);
    yield itemModel.updateMany({ _id: { $in: resultItems } }, { $set: _update });
    //返回新的accessorTag
    var now = Date.now();
    yield _updateAccessorWithThrow(accessorTag, {
        lastModified: now
    });
    if (needReturn) {
        var _project = { _id: 0 };
        if (returnFields && _.isArray(returnFields)) {
            for (let i = 0; i < returnFields.length; i++) {
                if (returnFields[i] === "tracer.ownerTag" || returnFields[i] === "tracer") continue; //只有拥有accessorTag的，才有权利修改accessor中的内容，防止误修改。
                _project[returnFields[i]] = 1; //return,防止mixed project error
            }
        } else {;
        }
        //
        var _criteria = { _id: { $in: resultItems } };
        return itemModel.find(_criteria, _project).exec(); //返回添加的item，不包含_id,不能直接操作。
    } else {
        return;
    }

};

function* _addOneItemToAccessorWithThrow(accessorTag, item, options) {
    var items = yield _addItemsToAccessorWithThrow(accessorTag, item, options);
    if (items) {
        var item = items[0];
        return item;
    }
    return;

}

function* _updateItemsInAccessorWithThrow(accessorTag, criteria, updated, options) { //complicated.  //updated 必须带上operator
    if (!options) options = {};
    var returnFields = options.returnFields;
    var needReturn = options.return;
    //
    var accessor = yield _getAccessorEditableOnlyProtoAndCategoryWithThrow(accessorTag);
    var copyOnWrite = accessor.proto.copyOnWrite;
    if (copyOnWrite) {
        yield _doCopyOnWrite(accessorTag);
    }

    var itemModel = yield _category2ModelWithThrow(accessor.category);
    var _criteria = { "tracer.ownerTag": accessorTag };
    _.defaults(_criteria, criteria);
    //
    var updatedItems = yield itemModel.find(_criteria, { _id: 1 }).exec(); //保存修改过的对象
    yield itemModel.updateMany(_criteria, updated);
    if (updatedItems.length > 0) {
        yield _updateAccessorWithThrow(accessorTag, { lastModifed: Date.now() });
    }
    if (needReturn) {
        var _project = { _id: 0 };
        if (returnFields && _.isArray(returnFields)) {
            for (let i = 0; i < returnFields.length; i++) {
                if (returnFields[i] === "tracer.ownerTag" || returnFields[i] === "tracer") continue; //只有拥有accessorTag的，才有权利修改accessor中的内容，防止误修改。
                _project[returnFields[i]] = 1; //return,防止mixed project error
            }
        } else {;
        }
        //
        return yield itemModel.find({ _id: { $in: updatedItems } }, _project).exec();
    }
    return;

};

function* _theOneItemInAccessorWithThrow(accessorTag, criteria, options) {
    var _options = { limit: 1 };
    _.defaults(_options, options);
    var items = yield _allItemsInAccessorWithThrow(accessorTag, criteria, _options);
    if (items && items.length > 0) {
        return items[0];
    }
    return undefined;
};

function* _itemsCountInAccessorWithThrow(accessorTag, criteria) {
    var accessor = yield getAccessorEditableOnlyCategoryWithoutAssert(accessorTag);
    var itemModel = yield _category2ModelWithThrow(accessor.category);

    var _criteria = { "tracer.ownerTag": accessorTag };
    _.defaults(_criteria, criteria);
    return yield itemModel.find(_criteria).count();
};

function* _isProtoOf(protoAccessorTag, accessorTag) {
    try {
        return yield _doCompareProto(accessorTag);
    } catch (e) {
        return false;
    }

    function* _doCompareProto(_accessorTag) {
        var accessor = yield _getAccessorEditableOnlyProtoWithThrow(_accessorTag);
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

function* _category2ModelWithThrow(category) {

    if (!_.isString(category)) {
        var err = { no: exceptionMgr.parameterException, context: { category: category } };
        throw err;
    }
    try {
        var itemModel = mongoose.model(category);
        return itemModel;
    } catch (e) {
        var err = { no: exceptionMgr.modelNotExist, context: { category: category, level: 7 } };
        throw err;
    }

};

function* _collapse2Proto(accessorTag, protoAccessorTag) {
    if (!protoAccessorTag) { //默认为到rootaccessor。
        var rootAccessorTagCfg = yield InitConfig.findOne(rootAccessorTagCfgCriteria);
        protoAccessorTag = rootAccessorTagCfg.value;
        //除自己外，将原型链上的所有accessor，标记为writeoncopy

    } else {
        var isInChain = yield _isProtoOf(protoAccessorTag, accessorTag);
        if (!isInChain) {
            return; //不做修改
        }
    }

    return yield _doSetWriteOnCopyOnProto(accessorTag);


    function* _doSetWriteOnCopyOnProto(_accessorTag) {
        var _accessor = yield _getAccessorEditableOnlyProtoWithThrow(_accessorTag);
        if (!_accessor.proto || !_accessor.proto.forward) {
            return; //root accessor
        }
        var _directProtoAccessor = yield _getAccessorEditableOnlyProtoAndCategoryWithThrow(_accessor.proto.forward);
        _directProtoAccessor.proto.writeOnCopy = true;
        var newProtoAccessor = yield _newAccessorEditableWithThrow(_directProtoAccessor.category, _directProtoAccessor.proto.forward);
        if (_directProtoAccessor.proto.association) { //把自己关联的拷贝
            newProtoAccessor.proto.association = _directProtoAccessor.proto.association;
        } else { //关联自己
            newProtoAccessor.proto.association = _directProtoAccessor.thisTag;

        }
        yield newProtoAccessor.save();
        _accessor.proto.forward = newProtoAccessor.thisTag;
        yield _accessor.save();
        yield _doSetWriteOnCopyOnProto(_accessor.proto.forward);

    };

};

function* _doCopyOnWrite(accessorTag) {
    var accessor = yield _getAccessorEditableOnlyProtoAndCategoryWithThrow(accessorTag);

    var copyedAccessor = yield _newAccessorEditableWithThrow(accessor.category, accessor.proto.forward); //copyedAccessor's copyonWrite is null or false;
    copyedAccessor.proto.copyOnWrite = true;
    yield copyedAccessor.save();
    yield _copyAllFromAccessorTo(accessorTag, copyedAccessor.thisTag);
    //原先的关联改成关联到copyed。
    yield _updateAccessorAssociationWithThrow(accessorTag, copyedAccessor.thisTag);
    accessor.proto.copyOnWrite = false;
    yield accessor.save();

    function* _copyAllFromAccessorTo(fromAccessorTag, toAccessorTag, criteria, project) {
        var fromAccessor = yield _getAccessorEditableOnlyCategoryWithThrow(fromAccessorTag);
        var itemModel = yield _category2ModelWithThrow(accessor.category);
        var _criteria = { "tracer.ownerTag": fromAccessorTag };
        _.defaults(_criteria, criteria);
        var _project = { _id: 0 };
        _.defaults(_project, project);
        var newItems = yield itemModel.find(_criteria, _project).exec();
        yield itemModel.insertMany(newItems);
        var _updated = { tracer: { ownerTag: toAccessorTag } };
        yield itemModel.updateMany({ _id: { $in: newItems } }, { $set: _updated });
    };

    function* _updateAccessorAssociationWithThrow(oldAssocition, newAssociation) {
        var _criteria = { "proto.association": oldAssocition };
        var _updated = { proto: { association: newAssocition } };
        yield Accessor.updateMany(_criteria, { $set: _updated });
    }

}


/**
 * 
 * 
 */
//accessor
module.exports.rootAccessorTag = async(_rootAccessorTag);
module.exports.addAccessorWithThrow = async(_addAccessorWithThrow);
module.exports.updateAccessorWithThrow = async(_updateAccessorWithThrow);

function* _rootAccessorTag() {
    var rootAccessorTag = yield _getSysConfigValue(rootAccessorTagCfgCriteria);
    if (!rootAccessorTag) {
        var accessor = new Accessor();
        yield _initAccessor(accessor);
        yield accessor.save();
        return accessor.thisTag;
    }
    return rootAccessorTag;

};

function* _addAccessorWithThrow(modelName, protoAccessorTag) {
    if (!protoAccessorTag) {
        var rootAccessorTag = yield _getSysConfigValue(rootAccessorTagCfgCriteria);
        protoAccessorTag = rootAccessorTag;
    }
    var _category = modelName;

    try {
        var itemModel = _category2ModelWithThrow(_category); //不要删，如果_category 不存在产生异常。
        var newAccessor = new Accessor();
        yield _initAccessor(newAccessor);
        newAccessor.category = _category;
        newAccessor.proto.forward = protoAccessorTag; //产生原型链
        newAccessor.lastModified = Date.now();
        newAccessor.forwardUpdated = Date.now();
        yield newAccessor.save();
        return newAccessor.thisTag;

    } catch (e) {

        var err = { no: exceptionMgr.parameterException, context: { category: modelName } };
        throw err;

    }
};

function* _updateAccessorWithThrow(accessorTag, updatedAccessorInfo) {
    if (!_.isObject(updatedAccessorInfo) || updatedAccessorInfo._id) {
        var err = { no: exceptionMgr.parameterException, context: { accessorInfo: updatedAccessorInfo } };
        throw err;
    }
    var _criteria = { thisTag: accessorTag };
    var _accessorInfo = {};
    if (updatedAccessorInfo.proto && updatedAccessorInfo.proto.forward) {
        var _accessor = yield _getAccessorEditableOnlyProtoWithThrow(accessorTag);
        if (_accessor.proto.forward !== updatedAccessorInfo.proto.forward) {
            _accessorInfo.forwardUpdated = Date.now();
        }
    }
    _.defaults(_accessorInfo, updatedAccessorInfo);
    var result = yield Accessor.update(_criteria, { $set: _accessorInfo });
    return result;

};

function* _initAccessor(accessor) {
    accessor.thisTag = yield getUniqTag();
    accessor.lastModifed = Date.now();
};

function* _getAccessorEditableOnlyProtoAndCategoryWithThrow(accessorTag) {
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

function* _getAccessorEditableOnlyLastModifiedWithThrow(accessorTag) {
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

function* _getAccessorEditableOnlyProtoWithThrow(accessorTag) {
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

function* _getAccessorEditableOnlyCategoryWithThrow(accessorTag) {
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

function* _getAccessorEditableOnlySpecialWithThrow(accessorTag) {

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

function* _getAccessorEditableOnlyConcurrentWithThrow(accessorTag) {

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



//initconfig
module.exports.addSysConfigWithThrow = async(_addSysConfigWithThrow);
module.exports.removeSysConfigWithThrow = async(_removeSysConfigWithThrow);
module.exports.updateSysConfigWithThrow = async(_updateSysConfigWithThrow);
module.exports.getSysConfigValue = async(_getSysConfigValue);

function* _updateSysConfigWithThrow(criteria, value) {
    if (!value) {
        var err = { no: exceptionMgr.parameterException, context: { value: value } };
        throw err;
    }
    var existCfg = yield InitConfig.findOne(criteria);
    if (!existCfg) {
        var err = { no: exceptionMgr.sysConfigNotExist, context: { criteria: criteria } };
        throw err;
    } else {
        existCfg.value = value;
        yield existCfg.save();
    }
};

function* _addSysConfigWithThrow(criteria, value) {
    if (!value) {
        var err = { no: exceptionMgr.parameterException, context: { value: value } };
        throw err;
    }
    var existCfg = yield InitConfig.findOne(criteria);
    if (!existCfg) {
        var newCfg = new InitConfig(criteria);
        newCfg.value = value;
        yield newCfg.save();
    } else {
        var err = { no: exceptionMgr.sysConfigNotExist, context: { criteria: criteria } };
        throw err;
    }
};

function* _removeSysConfigWithThrow(criteria) {
    yield InitConfig.remove(criteria);
};

function* _getSysConfigValue(criteria) {
    var existCfg = yield InitConfig.findOne(criteria);
    if (!existCfg) {
        return null;
    } else {
        return existCfg.value;
    }
};
//initconfig
//depreate
function* _keepItemsCountInAccessorBelowWithThrow(accessorTag, criteria, maxNums, sort) {
    var accessor = yield _getAccessorEditableOnlyCategoryWithThrow(accessorTag);
    var itemModel = yield _category2ModelWithThrow(accessor.category);

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
//depreate
function* _allItemsFromAccessorToWithThrow(fromAccessorTag, options) {
    if (!options) options = {};
    var toAccesorTag = options.toAccesorTag;
    var criteria = options.criteria;
    var returnFields = options.returnFields;

    var accessor = yield _getAccessorEditableOnlyCategoryWithThrow(fromAccessorTag);
    var itemModel = yield _category2ModelWithThrow(accessor.category);
    var resultItem = yield _doQueryInProtoChain();
    var _criteria = {};
    _.defaults(_criteria, criteria);
    //
    var _project = { _id: 0 }; //防止泄露原型信息
    if (returnFields && _.isArray(returnFields)) {
        for (let i = 0; i < returnFields.length; i++) {
            if (returnFields[i] === "tracer.ownerTag" || returnFields[i] === "tracer") continue; //只有拥有accessorTag的，才有权利修改accessor中的内容，防止误修改。
            _project[returnFields[i]] = 1; //return,防止mixed project error
        }
    } else {;
    }
    //
    var resultItems = [];
    yield _doQueryInProtoChain(fromAccessorTag);
    return resultItems;

    function* _doQueryInProtoChain(accessorTag) {
        var accessorWithProto = yield _getAccessorEditableOnlyProtoWithThrow(accessorTag);
        if (!accessorWithProto.proto || !accessorWithProto.proto.forward) {
            return;
        }
        _criteria.tracer.ownerTag = accessorTag; //修改查询对象
        if (accessorWithProto.proto.association) { //原型链已经专用了
            _criteria.tracer.ownerTag = accessorWithProto.proto.association;
        }
        var items = yield itemModel.find(_criteria, _project).exec();
        if (items.length > 0) {
            resultItems = resultItems.concat(items); //不保证item的唯一性，由应用自己解决。导致这个实用性不强。
        }
        if (accessorTag !== toAccesorTag) {
            return yield _doQueryInProtoChain(accessorWithProto.proto.forward);
        } else { return; }
    }
};