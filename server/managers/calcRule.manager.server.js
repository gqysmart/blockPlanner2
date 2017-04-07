/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const _ = require("lodash");
const { wrap: async, co: co } = require("co");
const assert = require("assert");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectID = require("mongoDB").ObjectID;

const MongoClient = require("mongoDB").MongoClient;
const GCDBConnString = "mongodb://127.0.0.1:27017/test";

const version = "v1"
const costClassesRelation = "architecture.costClasses" + version;
const termCollection = "architecture.terminology" + version;
const costCalRules = "architecture.costCalRules" + version;


const CalcRuleDescriptor = mongoose.model("CalcRuleDescriptor");
const CalcRuleAccessor = mongoose.model("CalcRuleAccessor");
const InitConfig = mongoose.model("InitConfig");


var inited = false;
var rootCalcRule = null;

module.exports.createCalcRuleAccessor = async(createCalcRuleAccessor);
//init 注意cluster时会引起混乱。
co(function*() {
    var calcRuleInited = yield InitConfig.findOne({ name: "calcRuleInited", category: "calc" }, { value: 1 });
    if (!calcRuleInited) { //copy form systmemb db
        var db = yield MongoClient.connect(GCDBConnString);
        var sysRules = yield db.collection(costCalRules).find().toArray();
        var originRule = new CalcRule();
        originRule.thisTag = new ObjectID();
        yield originRule.save();
        for (let i = 0; i < sysRules.length; i++) {
            var sysrule = sysRules[i];
            var tmpRule = new CalcRuleDescriptor();
            tmpRule.name = sysrule.nameID;
            tmpRule.rule.base = sysrule.compute.deps;
            tmpRule.rule.desc = sysrule.compute.desc;
            tmpRule.rule.markdown = sysrule.compute.markdown;
            tmpRule.tracer.ownerTag = originRule.thisTag;
            yield tmpRule.save();
        }
        inited = true;
        var rootRule = yield originRule.save();
        rootCalcRule = rootRule;
        var configInitedRule = new InitConfig({ name: "calcRuleInited", category: "calc", value: true });
        var configRootCalcRule = new InitConfig({ name: "rootCalcRule", category: "calc", value: rootRule._id });
        configRootCalcRule.save();
        configInitedRule.save();
    } else {

        inited = true;
        var configRoot = yield InitConfig.findOne({ name: "rootCalcRule", category: "calc" });
        rootCalcRule = configRoot.value;

    }
});

const defaultCreateOptions = {
    source: rootCalcRule, //源控制块ID，默认为根规则控制块_id
    //创建类型，默认为copy，依赖：子依赖父，父改=子改，子改父不改，如果父也改，子也改取子；拷贝：创建后，父改子不改；双向关联：父改子改，子改父改。
    //不指定源，默认从系统提供的规则块copy
    type: "copy",
};

function* createCalcRuleAccessor(options) {
    assert(inited);
    //参数调整
    if (!options) { options = {} };
    options = _.defaults(options, defaultCreateOptions);
    var sourceRuleId = options.source;
    var type = options.type; //copy，dependence，association双向等等。
    //
    var newRuleAccessor = new CalcRuleAccessor();
    newRuleAccessor.thisTag = new ObjectID();
    switch (type) {
        case "copy":

            break;
        case "dependence":
            break;
        case "association":
            break;
        default:
            return null;
    }


    var sourceRule = yield CalcRuleAccessor.findOne({ _id: sourceRuleId });
    newRuleAccessor.sourceTag = sourceRule.thisTag;
    yield newRuleAccessor.save();
    return newRuleAccessor.toObject();
};

module.exports.getCalcRuleDescriptor = async(function*(calcRuleTag, ruleName, cb) {
    assert(inited);
    var calcRule = yield CalcRule.findOne({ thisTag: calcRuleTag });
    var ruleDes = null;
    while (calcRule) {
        let ownerTag = calcRule.thisTag;
        let sourceTag = calcRule.sourceTag;
        ruleDes = yield CalcRuleDescriptor.findOne({ "tracer.ownerTag": ownerTag, name: ruleName });
        if (!ruleDes) {
            calcRule = yield calcRule.findOne({ thisTag: sourceTag })
        } else {
            break;
        }
    }
    if (ruleDes) {
        return cb(null, ruleDes)
    } else {
        var err = { no: -1, desc: "no found." }
        return cb(err, null);
    }

});