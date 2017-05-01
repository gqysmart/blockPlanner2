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
const sysConfig = require("../config/sys.js");
//

const dbMgr = require("./db.manager.server");
const termMgr = require("./terminology.manager.server");
const exceptionMgr = require("./exception.manager.server");
const rootCalcRuleAccessorTagCfgCriteria = dbMgr.rootCalcRuleAccessorTagCfgCriteria



const defaultCreateOptions = {
    //创建类型，默认为copy，依赖：子依赖父，父改=子改，子改父不改，如果父也改，子也改取子；拷贝：创建后，父改子不改；双向关联：父改子改，子改父改。
    //不指定源，默认从系统提供的规则块copy
    type: "copy",
};

function* ruleValidator(ruleInfo) {
    function* nameValidator(ruleInfo) {

    };

    function* ruleBasesValidator(ruleInfo) {

    };

    function* ruleDescValidator(ruleInfo) {

    };

    return {
        result: true,
        // desc: "validator err info"
    }

};

function* modifyCalcRule(ruleAccessorTag, ruleInfo) { //complicated.  //update，add  删除规则是没有必要且不允许的。
    function isRuleChanged(ruleA, ruleB) {
        return true; //这里确认规则改变的责任交给客户端完成。
    };

    function* ifRuleDesInself(ruleAccessorTag, ruleName) {
        var ruleDes = yield CalcRuleDescriptor.findOne({ "tracer.ownerTag": ruleAccessor.ruleAccessorTag, name: ruleName });
        if (!ruleDes) {
            return false;
        }
        return true; //在自身中
    };

    function* doAddCalcRule(ruleInfo) {

        return yield doUpateCalcrule(ruleInfo); //实际操作是一样的。
    };

    function* doUpateCalcrule(ruleInfo) {

        //判断是否是自己的修改列表，lastmodifed time 。
        yield dbMgr.holdLockAndOper(rulAccessorTag, async(function*() {
            var inSelf = yield ifRuleDesInself(rulAccessorTag, ruleInfo.name); //hold 之后再检查，因为有可能rulelist被修改过了。
            if (!inSelf) {
                //在原型链中
                var modifiedRuleDes = new CalcRuleDescriptor();
                modifiedRuleDes.name = ruleInfo.name;
                modifiedRuleDes.rule = ruleInfo.rule;
                modifiedRuleDes.tracer.ownerTag = rulAccessorTag;
                yield modifiedRuleDes.save();
                yield Accessor.findOneAndUpdate({ thisTag: ruleAccessorTag, version: sysConfig.version }, { "timemark.lastModified": Date.now() });
                //仅仅保存修改时间。

            } else {
                var existedRuleDes = yield getCalcRuleDescriptor(ruleAccessorTag, ruleInfo.name);

                existedRuleDes.rule = ruleInfo.rule;
                existedRuleDes.tracer.updatedTime = Date.now();
                yield existedRuleDes.save();
                yield Accessor.findOneAndUpdate({ thisTag: ruleAccessorTag, version: sysConfig.version }, { "timemark.lastModified": Date.now() });
                //仅仅保存修改时间。

            }

        }));


    };
    //判断值是不是一样，不一样，就添加一个owner为自己的descriptor。
    //1. 
    var isValidated = yield ruleValidator(ruleInfo);
    if (!isValidated.result) {
        var err = { no: -1, desc: isValidated.desc };
        throw (err);
    }
    var ruleName = ruleInfo.name;
    var ruleAccessor = yield Accessor.findOne({ thisTag: ruleAccessorTag, version: sysConfig.version });
    var existedRuleDes = yield getCalcRuleDescriptor(ruleAccessorTag, ruleName);
    if (!existedRuleDes) {
        //如果没有，add 计算规则，需要对规则进行必要的验证。
        yield doAddCalcRule(ruleInfo);
    } else {
        var changed = isRuleChanged(ruleInfo, existedRuleDes);
        if (changed) {
            yield doUpateCalcrule(ruleInfo);
        }
    }

};
const defaultModifyCalcRuleOptions = {
    discard: false
};

function* modifyCalcRuleProto(protoAccessorTag, accessorTag, options) {
    if (!options) { options = {} };
    _.defaults(options, defaultModifyCalcRuleOptions);
    var inChain = yield dbMgr.isProtoOf(accessorTag, protoAccessorTag); //防止死循坏
    if (inChain) {
        return false;
    }
    var accessor = yield Accessor.findOne({ thisTag, accessorTag, version: sysConfig.version });

    if (options.discard) //抛弃掉以前在原proto时时的修改。
    {
        yield CalcRuleDescriptor.remove({ "tracer.ownerTag": accessorTag });

    } else {
        yield collapseTo(accessorTag);

    }
    // accessor.timemark.lastModifed;//自身没有修改
    accessor.proto.forward = protoAccessorTag;
    accessor.timemark.forward = Date.now();
    yield accessor.save();
    return true;

}

function* isProtoRuleUpdated(accessorTag) {
    var accessor = yield Accessor.findOne({ thisTag: accessorTag, version: sysConfig.version });
    if (!accessor) {
        var err = { no: -1, desc: `accessorTag=${accessorTag} doen't exist.` };
        throw (err);
    }
    var forwardAccessor = yield Accessor.findOne({ thisTag: accessor.proto.forward, version: sysConfig.version });

    if (forwardAccessor.timemark.forward > accessor.timemark.forward || forwardAccessor.timemark.lastModifed > accessor.timemark.lastModifed) {
        return true;
    }
    if (!forwardAccessor.proto.forward) { //到头了。
        return false;
    } else {
        return yield isProtoRuleUpdated(forwardAccessor.thisTag);
    }

}

function* collapseTo(accessorTag, toProtoAccessorTag) {
    if (!toProtoAccessorTag) { //到底
        var rootRuleAccessorTagCfg = yield InitConfig.findOne(rootCalcRuleAccessorTagCfgCriteria);
        toProtoAccessorTag = rootRuleAccessorTagCfg.value;
    }
    var isInChain = yield dbMgr.accessor.isProtoOf(toProtoAccessorTag, accessorTag);
    if (!isInChain) {
        return true; //不做修改
    }
    var accessor = yield Accessor.findOne({ thisTag: accessorTag, version: sysConfig.version });
    var forwardAccessor = yield Accessor.findOne({ thisTag: accessor.proto.forward, version: sysConfig.version });
    if (!forwardAccessor.proto.forward) //不拷贝root 。
    {
        return true;
    }
    var count = yield CalcRuleDescriptor.find({ "tracer.ownerTag": forwardAccessor.thisTag }).count();
    if (count > 0) {
        var accItems = yield CalcRuleDescriptor.find({ "tracer.ownerTag": accessor.thisTag }, { _id: 0, name: 1 }).toArray();
        var accNames = [];
        for (let i = 0; i < accItems.length; i++) {
            accNames.push(accItems.name);
        }
        var forwardItems = yield CalcRuleDescriptor.find({ "tracer.ownerTag": forwardAccessor.thisTag }).select({ _id: 0, name: 1, value: 1 }).nin("name", accNames).toArray();
        for (let i = 0; i < forwardItems.length; i++) {
            forwardItems[i].tracer = { updatedTime: Date.now(), ownerTag: accessor.thisTag };
        }
        yield CalcRuleDescriptor.insertMany(forwardItems);
    }


    accessor.proto.forward = forwardAccessor.proto.forward;
    accessor.timemark.forwardUpdated = Date.now(); //不需要修改lastmodified。
    yield accessor.save();

    if (forwardAccessor.thisTag !== toProtoAccessorTag) {
        return yield collapseTo(accessor.thisTag, toProtoAccessorTag);
    }
    return true;

}



function* createCalcRules(sourceRuleAccessorTag) {
    //参数调整
    if (!sourceRuleAccessorTag) {
        var sourceRuleAccessorTagCfg = yield InitConfig.findOne(dbMgr.rootCalcRuleAccessorTagCfgCriteria);
        sourceRuleAccessorTag = sourceRuleAccessorTagCfg.value;
    }
    //copy，dependence等等。
    //
    var newRuleAccessor = yield dbMgr.newAccessorEditable("RULE", sourceRuleAccessorTag);

    return newRuleAccessor.save();
};

module.exports.createCalcRules = async(createCalcRules);

//refactory

function* addRuleDescriptorByRuleDefine(ruleAccessorTag, terminologyTag, ruleDefines) {
    if (!_.isArray(ruleDefines)) {
        ruleDefines = [ruleDefines];
    }
    var ruleDescriptors = [];
    for (let i = 0; i < ruleDefines.length; i++) {
        var ruleDefine = ruleDefines[i];
        var name = yield parseName(ruleDefine.name);
        var bases = yield parseBases(ruleDefine.bases);
        var style = yield parseStyle(ruleDefine.ruleType);

        var item = {
            name: name,
            rule: {
                bases: bases,
                formula: ruleDefine.formula,
                iValue: ruleDefine.iValue
            },
        };
        ruleDescriptors.push(item);
    }

    function* parseBases(bases) {
        if (!bases) {
            return null;
        }
        var result = [];

        var descSegs = bases.split("|");
        for (let i = 0; i < descSegs.length; i++) {
            var baseDesc = descSegs[i].split(":");
            result[baseDesc[0] - 1] = yield termMgr.qualifiedName2TerminologyTagWithThrow(baseDesc[1], terminologyTag);
        }
        return result;

    }

    function* parseStyle(aString) {
        return styleNameMap[aString];
    };

    function* parseName(aString) {
        yield termMgr.qualifiedName2TerminologyTagWithThrow(aString, terminologyTag);
    }
    var context = {};
    yield dbMgr.holdLockAndOperWithAssertWithThrow(ruleAccessorTag, async(function*() {

        if (ruleDescriptors.length > 0) {
            yield dbMgr.addItemsToAccessorWithThrow(ruleAccessorTag, ruleDescriptors);

        }

    }), context);


};

const styleNameMap = {
    "组": "D4"
};
// "D0", //字符型描述规则,
// "D1", //地区地址描述性规则,
// "D2", //时刻时间描述性规则，
// "D3", //普通数值规则
// "D4", //组合关系描述规则
module.exports.addRuleDescriptorByRuleDefine = async(addRuleDescriptorByRuleDefine);