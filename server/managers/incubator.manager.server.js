/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const { wrap: async } = require("co");
const fs = require("fs");
const mongoose = require("mongoose");
const assert = require("assert");
const ObjectID = require("mongoDB").ObjectID;
const PDCMgr = require("./pdc.manager.server");
const dbMgr = require("./db.manager.server");
const calcRuleMgr = require("./calcRule.manager.server");
const recordMgr = require("./record.manager.server");
const sysConfig = require("../config/sys");
const terminologyMgr = require("./terminology.manager.server");

const Accessor = mongoose.model("Accessor");
const Incubator = mongoose.model("Incubator");
const InitConfig = mongoose.model("InitConfig");
const Record = mongoose.model("Record");
var incubatorManager = {

};
module.exports = incubatorManager;
incubatorManager.createIncubator = async(createIncubator);

function* getUniqIncubatorName() {
    return new ObjectID();
}
module.exports.createIncubator = async(createIncubator);

function* createIncubator(incubatorInfo, calcRuleAccessorTag, incubatorAccessorTag) {

    var newincubator = new Incubator(incubatorInfo);
    if (!incubatorAccessorTag) {
        var incubatorAccessor = new Accessor();
        dbMgr.initIncubatorAccessor(incubatorAccessor);
        yield incubatorAccessor.save();
        incubatorAccessorTag = incubatorAccessor.thisTag;
    }
    newincubator.tracer.ownerTag = incubatorAccessorTag;
    //
    var pdcAccessor = new Accessor();
    dbMgr.initPDCAccessor(pdcAccessor);
    yield pdcAccessor.save();

    var recordAccessor = new Accessor();
    dbMgr.initRecordAccessor(recordAccessor);
    yield recordAccessor.save();

    if (!calcRuleAccessorTag) {
        var calcRuleAccessor = yield calcRuleMgr.createCalcRules();
        calcRuleAccessorTag = calcRuleAccessor.thisTag;
    }

    newincubator.name = yield getUniqIncubatorName()
    newincubator.strategy.calcRuleAccessorTag = calcRuleAccessorTag;
    newincubator.container.PDCAccessorTag = pdcAccessor.thisTag;
    newincubator.container.recordAccessorTag = recordAccessor.thisTag;

    yield newincubator.save();
    return newincubator;
};

function* transferRuleName2Category(ruleName) {
    return ruleName.toString();
};
module.exports.getRecordFromIncubatorByRuleTerminologyTag = async(getRecordFromIncubatorByRuleTerminologyTag);

function* getRecordFromIncubatorByRuleTerminologyTag(incubatorAccessorTag, incubatorName, ruleTerminologyTag) {
    var category = yield transferRuleName2Category(ruleTerminologyTag);
    var incubatorAccessor = yield Accessor.findOne({ thisTag: incubatorAccessorTag, version: sysConfig.version });
    var incubator = yield Incubator.findOne({ "tracer.ownerTag": incubatorAccessor.thisTag, name: incubatorName });
    var environment = incubator.strategy.calcRuleAccessorTag.toString();
    var existRecord = yield Record.findOne({
        "tracer.owner": incubator.container.recordAccessorTag,
        "record.category": category,
        "record.environment": environment
    });
    if (!existRecord) {
        //不存在重新计算，并record。,不需要二次查询。
        var newRecord = yield laborAndRecord();
        return newRecord.data;
    } else {
        //存在查看记录时间和规则修改的时间，是否记录已经过时。
        var calcRuleAccessor = yield Accessor.findOne({ thisTag: incubator.strategy.calcRuleAccessorTag, version: sysConfig.version });
        if (existRecord.tracer.updatedTime < calcRuleAccessor.timemark.lastModified || existRecord.tracer.updatedTime < calcRuleAccessor.timemark.forwardUpdated) {
            //重新计算并记录
            //不存在重新计算，并record。,不需要二次查询。
            var newRecord = yield laborAndRecord();
            return newRecord.data;

        } else { //记录存在且最新，将记录返回。
            //查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。
            return existRecord.data;
        }
    }

    function* laborAndRecord() {
        var terminologyAccessorTagCfg = yield InitConfig.findOne(dbMgr.terminologyAccessorTagCfgCriteria);
        var content = yield constructHierarchy(ruleTerminologyTag, incubator.container.PDCAccessorTag, incubator.strategy.calcRuleAccessorTag, terminologyAccessorTagCfg.value);
        var data = {
            body: content
        };
        recordHierarchy(data, incubator.container.recordAccessorTag);
    }

};
//对于新建方案可以使用写时再复制的方法。第一个方案新建后，后面的方案都是对原方案的引用。



function* constructHierarchy(rootCalcRuleName, pdcAccessorTag, calcRuleAccessorTag, terminologyAccessorTag) {
    var calcRuleDescriptor = yield calcRuleMgr.getCalcRuleDescriptor(calcRuleAccessorTag, rootCalcRuleName);
    if (!calcRuleDescriptor) {
        var err = { no: -1, desc: `can't get name=${rootCalcRuleName}'s calcRule descriptor.` };
        throw (err);
    }
    var value = yield PDCMgr.getCalcRuleValueFromPDC(pdcAccessorTag, calcRuleAccessorTag, rootCalcRuleName);
    if (null === value) {
        var err = { no: -1, desc: `can't get name=${rootCalcRuleName} data from PDC.` };
        throw (err);
    }

    var qualifiedName = yield terminologyMgr.terminologyTag2QualifiedName(rootCalcRuleName, terminologyAccessorTag);

    var node = {
        name: {
            tag: rootCalcRuleName,
            qualified: qualifiedName,
        },
        calcRuleDes: calcRuleDescriptor.rule.desc,
        value: value,
        children: []
    };
    var bases = calcRuleDescriptor.rule.bases;
    for (let i = 0; i < bases.length; i++) {
        let childObject = yield constructHierarchy(bases[i], pdcAccessorTag, calcRuleAccessorTag, terminologyAccessorTag);
        node.children.push(childObject);
    }
    return node;
};

const defaultCostHierarchyRecordOptons = {
    category: "costClass",
    duration: 2 * 365, //unit is day，默认为2天
    style: "cover" //[cover,keep:n]
}

function* recordHierarchy(data, recordAccessorTag, options) {
    if (!options) { options = {} };
    _.defaults(options, defaultCostHierarchyRecordOptons);

    var recordAccessor = yield recordMgr.record(data, options, recordAccessorTag);
    if (!recordAccessor) {
        var err = { no: -1, desc: `recordd errored.` }
        throw (err);
    }
    return recordAccessor;


}

module.exports.recordCostHierarchy = async(recordHierarchy);