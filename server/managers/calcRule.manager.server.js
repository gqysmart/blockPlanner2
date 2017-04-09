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
const CalcRuleDescriptor = mongoose.model("CalcRuleDescriptor");
//const CalcRuleAccessor = mongoose.model("CalcRuleAccessor");
const InitConfig = mongoose.model("InitConfig");
const Accessor = mongoose.model("Accessor");
const dbManager = require("./db.manager.server");
const rootCalcRuleAccessorTagCfgCriteria = dbManager.rootCalcRuleAccessorTagCfgCriteria



const defaultCreateOptions = {
    //创建类型，默认为copy，依赖：子依赖父，父改=子改，子改父不改，如果父也改，子也改取子；拷贝：创建后，父改子不改；双向关联：父改子改，子改父改。
    //不指定源，默认从系统提供的规则块copy
    type: "copy",
};



function* modifyCalcRule(ruleAccessorTag, ruleInfo) { //complicated.
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
    //判断值是不是一样，不一样，就添加一个owner为自己的descriptor。
    //1. 
    var ruleName = ruleInfo.name;
    var ruleAccessor = yield Accessor.findOne({ thisTag: ruleAccessorTag });
    var existedRuleDes = yield getCalcRuleDescriptor(ruleAccessorTag, ruleName);
    if (!existedRuleDes) {
        var err = { no: -1, desc: `modifyCalcRule:ruleAccessorTag=${ruleAccessorTag},ruleName=${ruleName} doesn't exist.` }
        throw (err);
    }
    var changed = isRuleChanged(ruleInfo, existedRuleDes);
    if (changed) {
        //判断是否是自己的修改列表，lastmodifed time 。

        var inSelf = yield ifRuleDesInself(rulAccessorTag);
        if (!inSelf) {
            //在原型链中
            var modifiedRuleDes = new CalcRuleDescriptor();
            modifiedRuleDes.name = ruleInfo.name;
            modifiedRuleDes.rule = ruleInfo.rule;
            modifiedRuleDes.tracer.ownerTag = rulAccessorTag;
            yield modifiedRuleDes.save();
            ruleAccessor.timemark.lastModifed = Date.now();
            yield ruleAccessor.save(); //仅仅保存修改时间。

        } else {

            existedRuleDes.rule = ruleInfo.rule;
            existedRuleDes.tracer.updatedTime = Date.now();
            yield existedRuleDes.save();
            ruleAccessor.timemark.lastModifed = Date.now();
            yield ruleAccessor.save(); //仅仅保存修改时间。

        }



    }



}
const defaultModifyCalcRuleOptions = {
    discard: false
};

function* modifyCalcRuleProto(protoAccessorTag, accessorTag, options) {
    if (!options) { options = {} };
    _.defaults(options, defaultModifyCalcRuleOptions);
    var inChain = yield dbManager.isProtoOf(accessorTag, protoAccessorTag); //防止死循坏
    if (inChain) {
        return false;
    }
    var accessor = yield Accessor.findOne({ thisTag, accessorTag });
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
    var accessor = yield Accessor.findOne({ thisTag: accessorTag });
    if (!accessor) {
        var err = { no: -1, desc: `accessorTag=${accessorTag} doen't exist.` };
        throw (err);
    }
    var forwardAccessor = yield Accessor.findOne({ thisTag: accessor.proto.forward });

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
    var isInChain = yield isProtoOf(toProtoAccessorTag, accessorTag);
    if (!isInChain) {
        return true; //不做修改
    }
    var accessor = yield Accessor.findOne({ thisTag: accessorTag });
    var forwardAccessor = yield Accessor.findOne({ thisTag: accessor.proto.forward });
    if (!forwardAccessor.proto.forward) //不拷贝root 。
    {
        return true;
    }
    var count = yield CalcRuleDescriptor.find({ "tracer.owner": forwardAccessor.thisTag }).count();
    if (count > 0) {
        var accItems = yield CalcRuleDescriptor.find({ "tracer.owner": accessor.thisTag }, { _id: 0, name: 1 }).toArray();
        var accNames = [];
        for (let i = 0; i < accItems.length; i++) {
            accNames.push(accItems.name);
        }
        var forwardItems = yield CalcRuleDescriptor.find({ "tracer.owner": forwardAccessor.thisTag }).select({ _id: 0, name: 1, value: 1 }).nin("name", accNames).toArray();
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





function* createCalcRules(sourceRuleAccessorTag, options) {

    //参数调整
    if (!options) { options = {} };
    options = _.defaults(options, defaultCreateOptions);
    //copy，dependence等等。
    //
    var newRuleAccessor = null;
    switch (options.type) {
        case "copy":
            newRuleAccessor = yield co(createCalcRuleByCopy());
            break;
        case "proto":
            newRuleAccessor = yield co(createCalcRuleByProto());
            break;

        default:
            newRuleAccessor = null;
    }
    return newRuleAccessor;

    function* createCalcRuleByCopy() {
        var aRuleAccessor = new Accessor();
        dbManager.initCalcRuleAccessor(newRuleAccessor);
        aRuleAccessor.proto.forward = sourceRuleAccessorTag;
        aRuleAccessor.timemark.forward = Date.now();
        yield aRuleAccessor.save();

        yield collapseTo(aRuleAccessor.thisTag);

        aRuleAccessor = yield Accessor.findOne({ thisTag: aRuleAccessor.thisTag }); //重新更新一次。

        return aRuleAccessor;
    };

    function* createCalcRuleByProto() {
        var aRuleAccessor = new Accessor();
        dbManager.initCalcRuleAccessor(newRuleAccessor);

        aRuleAccessor.proto.forward = sourceRuleAccessorTag;
        aRuleAccessor.timemark.forwardUpdated = Date.now();
        yield aRuleAccessor.save();

        return aRuleAccessor;
    };


};
module.exports.createCalcRules = async(createCalcRules);
module.exports.getCalcRuleDescriptor = async(getCalcRuleDescriptor);

function* getCalcRuleDescriptor(calcRuleAccessorTag, ruleName) {
    var calcRuleAccessor = yield Accessor.findOne({ thisTag: calcRuleAccessorTag });
    var ruleDes = null;
    while (calcRuleAccessor) {
        let ownerTag = calcRuleAccessor.thisTag;
        let sourceAccessorTag = calcRuleAccessor.proto.forward;

        ruleDes = yield CalcRuleDescriptor.findOne({ "tracer.ownerTag": ownerTag, name: ruleName });

        if (!ruleDes) {
            calcRuleAccessor = yield Accessor.findOne({ thisTag: sourceAccessorTag });
            continue;
        }
        break;
    }
    if (ruleDes) {
        return ruleDes;
    } else {
        var err = { no: -1, desc: `calcruleName=${ruleName} and accessor=${calcRuleAccessorTag} hasn't found ruledes` };
        throw (err);
    }
};