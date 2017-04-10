/**
 * 
 * 对于cluster来说，需要一个主控制机来完成系统初始化的任务，防止多任务冲突
 */


const path = require("path");
const _ = require("lodash");
const { wrap: async, co: co } = require("co");
const assert = require("assert");
const fs = require("fs");
const sysConfig = require("../config/sys");
const config = require("../config/config");
const ObjectID = require("mongoDB").ObjectID;
const version = sysConfig.version;
const MongoClient = require("mongoDB").MongoClient;
const systemDbConnectString = sysConfig.systemdb.connectString;
const appDbConnectString = sysConfig.appdb.connectString;
const models = path.join(__dirname, "..", "models");
const dbManager = require("./db.manager.server");
const logManager = require("./log.manager.server");

//

const costClassesRelation = "architecture.costClasses" + version;
const termCollection = "architecture.terminology" + version;
const costCalRules = "architecture.costCalRules" + version;

//是在maincluster中运行，没有加载mongoose model，需另加

// mongoose model
const mongoose = require("mongoose");
mongoose.connect(appDbConnectString);
const InitConfig = mongoose.model("InitConfig");
const Log = mongoose.model("Log");
const Accessor = mongoose.model("Accessor");
const Terminology = mongoose.model("Terminology");

//
const initedCfgCriteria = dbManager.sysinitedCfgCriteria;
const rootCalcRuleIDCfgCriteria = dbManager.rootCalcRuleAccessorTagCfgCriteria;
const terminologyAccessorTagCriteria = dbManager.terminologyAccessorTagCfgCriteria;
const systemLogAccessorTagCfgCriteria = dbManager.sysinitedCfgCriteria;

//
module.exports.init = async(function*(cb) {
    ////system inited
    var initedCfg = yield InitConfig.findOne(initedCfgCriteria);
    if (!initedCfg) {
        try {
            yield co(initSystemLog()); //1
            yield co(initTerminologyDB());
            yield co(initCalcRuleDB());
            initedCfg = new InitConfig(initedCfgCriteria);
            initedCfg.value = true;
            yield initedCfg.save();


        } catch (e) {
            throw (e);

        } finally {
            console.log("times");
        }


    }
    if (cb) {
        cb();
    }
});

//


function* initCalcRuleDB() {

    var rootCalcRuleIDCfg = yield InitConfig.findOne(rootCalcRuleIDCfgCriteria, { value: 1 });
    if (!rootCalcRuleIDCfg) { //copy form systmemb db
        var db = yield MongoClient.connect(systemDbConnectString);
        var sysRules = yield db.collection(costCalRules).find().toArray();
        var originRule = new Accessor();
        dbManager.initCalcRuleAccessor(originRule);
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
        yield originRule.save();

        rootCalcRuleIDCfg = new InitConfig(rootCalcRuleIDCfgCriteria);
        rootCalcRuleIDCfg.value = originRule.thisTag;
        yield rootCalcRuleIDCfg.save();

        db.close();
    }

}



function* initSystemLog() {
    var logAccessor = new Accessor();
    dbManager.initLogAccessor(logAccessor);
    yield logAccessor.save();

    var logCfg = new InitConfig(systemLogAccessorTagCfgCriteria);
    logCfg.value = logAccessor.thisTag;
    yield logCfg.save();

}

function* initTerminologyDB() {

    var terminologyCfg = yield InitConfig.findOne(terminologyAccessorTagCriteria, { value: 1 });
    if (!terminologyCfg) { //copy form systmemb db
        var db = yield MongoClient.connect(systemDbConnectString);
        var systerms = yield db.collection(termCollection).find().toArray();
        var termAccessor = new Accessor();
        dbManager.initTerminologyAccessor(termAccessor);
        yield termAccessor.save();

        for (let i = 0; i < systerms.length; i++) {

            var newTerminology = new Terminology(systerms[i]);
            newTerminology.tracer.ownerTag = termAccessor.thisTag;
            yield newTerminology.save();

        }
        var terminologyAccessorTagCfg = new InitConfig(terminologyAccessorTagCriteria);
        terminologyAccessorTagCfg.value = termAccessor.thisTag;
        yield terminologyAccessorTagCfg.save();
        db.close();

    }
}