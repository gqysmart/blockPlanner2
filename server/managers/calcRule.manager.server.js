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

function* changeAssociation() {};

function* changeSource() {};

function* modifyCalcRule(ruleAccessorTag, ruleInfo) {
    //判断值是不是一样，不一样，就添加一个owner为自己的descriptor。
}

function* createCalcRules(sourceRuleAccessorTag, options) {

    //参数调整
    if (!options) { options = {} };
    options = _.defaults(options, defaultCreateOptions);
    //copy，dependence，association双向等等。
    //
    var newRuleAccessor = null;
    switch (options.type) {
        case "copy":
            newRuleAccessor = yield co(createCalcRuleByCopy());
            break;
        case "dependence":
            newRuleAccessor = yield co(createCalcRuleByDependence());
            break;
        case "association":
            newRuleAccessor = yield co(createCalcRuleByAssociation());
            break;
        default:
            newRuleAccessor = null;
    }
    return newRuleAccessor;

    function* createCalcRuleByCopy() {
        var aRuleAccessor = new Accessor();
        dbManager.initCalcRuleAccessor(newRuleAccessor);

        var rootRuleAccessorTagCfg = yield InitConfig.findOne(rootCalcRuleAccessorTagCfgCriteria);
        var rootRuleAccessor = yield Accessor.findOne({ thisTag: rootRuleAccessorTagCfg.value });

        if (sourceRuleAccessorTag !== rootRuleAccessor.thisTag) {
            //将source 链上的修改都拷贝为自己的操作
            var currentAccessorTag = sourceRuleAccessorTag;
            var modifiedRules = [];
            while (currentAccessorTag !== rootRuleAccessor.thisTag) {
                var currentItems = yield CalcRuleDescriptor.find({ "tracer.owner": currentAccessorTag }, { _id: 0 }).toArray();
                modifiedRules = _.concat(modifiedRules, currentItems);

                var currentAccessor = yield Accessor.findOne({ thisTag: currentAccessorTag });
                var currentAssociationAccessor = yield Accessor.findOne({ thisTag: currentAccessor.proto.association });
                var associationItems = yield CalcRuleDescriptor.find({ "tracer.owner": currentAssociationAccessor.thisTag }).toArray();
                modifiedRules = _.concat(modifiedRules, associationItems);

                //recursive
                currentAccessorTag = currentAccessor.proto.forward;

            }
            _.uniqWith(modifiedRules, _.isEqual); //防止关联到同一个ruleaccessor的情况。

            for (let i = 0; i < modifiedRules.length; i++) {
                modifiedRules[i].tracer.ownerTag = aRuleAccessor.thisTag;
            }
            yield CalcRuleDescriptor.insertMany(modifiedRules);


        } //不做拷贝操作
        aRuleAccessor.proto.forward = rootRuleAccessor.thisTag;
        yield aRuleAccessor.save();

        return aRuleAccessor;
    };

    function* createCalcRuleByDependence() {
        var aRuleAccessor = new Accessor();
        dbManager.initCalcRuleAccessor(newRuleAccessor);

        aRuleAccessor.proto.forward = sourceRuleAccessorTag;
        yield aRuleAccessor.save();

        return aRuleAccessor;




    };

    function* createCalcRuleByAssociation() {

        var aRuleAccessor = new Accessor();
        dbManager.initCalcRuleAccessor(newRuleAccessor);

        var rootRuleAccessorTagCfg = yield InitConfig.findOne(rootCalcRuleAccessorTagCfgCriteria);
        var rootRuleAccessor = yield Accessor.findOne({ thisTag: rootRuleAccessorTagCfg.value });
        if (sourceRuleAccessorTag !== rootRuleAccessor.thisTag) {
            aRuleAccessor.proto.forward = rootRuleAccessor.thisTag;
            aRuleAccessor.proto.association = sourceRuleAccessorTag;
        } else { //重复，舍弃掉association
            aRuleAccessor.proto.forward = sourceRuleAccessorTag;
        }

        yield aRuleAccessor.save();


        return aRuleAccessor;

    };
};
module.exports.createCalcRules = async(createCalcRules);
module.exports.getCalcRuleDescriptor = async(function*(calcRuleAccessorTag, ruleName) {
    var calcRuleAccessor = yield Accessor.findOne({ thisTag: calcRuleAccessorTag });
    var ruleDes = null;
    while (calcRuleAccessor) {
        let ownerTag = calcRuleAccessor.thisTag;
        let sourceAccessorTag = calcRuleAccessor.proto.forward;
        let associationAccessorTag = calcRuleAccessor.proto.association;

        ruleDes = yield CalcRuleDescriptor.findOne({ "tracer.ownerTag": ownerTag, name: ruleName });
        if (!ruleDes) {
            //先查找关联
            if (associationAccessorTag) {
                ruleDes = yield CalcRuleDescriptor.findOne({ "tracer.ownerTag": associationAccessorTag, name: ruleName });
            }
        } //再复制源
        if (!ruleDes) {
            calcRuleAccessor = yield Accessor.findOne({ thisTag: sourceAccessorTag });
            continue;
        }
    }
    if (ruleDes) {
        return ruleDes;
    } else {
        var err = { no: -1, desc: `calcruleName=${ruleName} and accessor=${calcRuleAccessorTag} hasn't found ruledes` };
        throw (err);
    }
});