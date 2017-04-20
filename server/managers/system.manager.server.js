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
const dbMgr = require("./db.manager.server");
const termMgr = require("./terminology.manager.server");
const logManager = require("./log.manager.server");
const recursive = require("recursive-readdir");

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
const CalcRuleDescriptor = mongoose.model("CalcRuleDescriptor");

//
const initedCfgCriteria = dbMgr.sysinitedCfgCriteria;
const rootCalcRuleIDCfgCriteria = dbMgr.rootCalcRuleAccessorTagCfgCriteria;
const terminologyAccessorTagCriteria = dbMgr.terminologyAccessorTagCfgCriteria;
const systemLogAccessorTagCfgCriteria = dbMgr.sysinitedCfgCriteria;
const rootAccessorTagCfgCriteria = dbMgr.rootAccessorTagCfgCriteria;

//
module.exports.init = async(function*(cb) {
    ////system inited
    var initedCfg = yield InitConfig.findOne(initedCfgCriteria);
    if (!initedCfg) {
        try {
            yield co(initProtoChain());
            //   yield co(initSystemLog()); //1
            yield co(initTerminologyDBFromLocale());
            // yield co(initTerminologyDBFromRemote());
            yield co(initCalcRuleDB());
            initedCfg = new InitConfig(initedCfgCriteria);
            initedCfg.value = true;
            yield initedCfg.save();


        } catch (e) {

            yield Terminology.remove();
            yield InitConfig.remove()
            yield CalcRuleDescriptor.remove();
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

function* initProtoChain() {
    var rootAccessor = yield dbMgr.newNullAccessor();
    rootAccessor.category = "ROOT";

    var rootAccessorTagCfg = new InitConfig(rootAccessorTagCfgCriteria);
    rootAccessorTagCfg.value = rootAccessor.thisTag;
    yield rootAccessorTagCfg.save();
    yield rootAccessor.save();
};

function* initCalcRuleDB() {

    var rootCalcRuleIDCfg = yield InitConfig.findOne(rootCalcRuleIDCfgCriteria, { value: 1 });
    if (!rootCalcRuleIDCfg) { //copy form systmemb db
        var db = yield MongoClient.connect(systemDbConnectString);
        var sysRules = yield db.collection(costCalRules).find().toArray();
        var originRule = new Accessor();
        yield dbMgr.initCalcRuleAccessor(originRule);
        yield originRule.save();
        for (let i = 0; i < sysRules.length; i++) {
            var sysrule = sysRules[i];
            var tmpRule = new CalcRuleDescriptor();
            tmpRule.name = sysrule.name;
            tmpRule.rule.bases = sysrule.rule.bases;
            tmpRule.rule.desc = sysrule.rule.desc;
            tmpRule.rule.markdown = sysrule.rule.markdown;
            tmpRule.tracer.ownerTag = originRule.thisTag;
            yield tmpRule.save();
        }

        rootCalcRuleIDCfg = new InitConfig(rootCalcRuleIDCfgCriteria);
        rootCalcRuleIDCfg.value = originRule.thisTag;
        yield rootCalcRuleIDCfg.save();

        db.close();
    }

}



function* initSystemLog() {
    var logAccessor = new Accessor();
    yield dbMgr.initLogAccessor(logAccessor);
    yield logAccessor.save();

    var logCfg = new InitConfig(systemLogAccessorTagCfgCriteria);
    logCfg.value = logAccessor.thisTag;
    yield logCfg.save();

}

function* initTerminologyDBFromRemote() {

    var terminologyCfg = yield InitConfig.findOne(terminologyAccessorTagCriteria, { value: 1 });
    if (!terminologyCfg) { //copy form systmemb db
        var db = yield MongoClient.connect(systemDbConnectString);
        var systerms = yield db.collection(termCollection).find().toArray();
        var termAccessor = new Accessor();
        yield dbMgr.initTerminologyAccessor(termAccessor);
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
};

function* initTerminologyDBFromLocale() {

    var terminologyAccessorTagCfg = yield InitConfig.findOne(terminologyAccessorTagCriteria, { value: 1 }).exec();
    if (!terminologyAccessorTagCfg) { //copy form systmemb db
        var sysTerminologyAccessor = yield dbMgr.newAccessorEditable("TERMINOLOGY");
        var sysTerminologyAccessorTag = sysTerminologyAccessor.thisTag;
        yield sysTerminologyAccessor.save();
        terminologyAccessorTagCfg = new InitConfig(terminologyAccessorTagCriteria);
        terminologyAccessorTagCfg.value = sysTerminologyAccessorTag;
        yield terminologyAccessorTagCfg.save();
        var rulesPath = path.join(__dirname, "..", "rules");
        recursive(rulesPath, [".*"], function(err, files) {
            for (let i = 0; i < files.length; i++) {
                var file = files[i];
                co(function*() {

                    var jsonRules = require(file);
                    for (let i = 0; i < jsonRules.length; i++) {

                        yield termMgr.addTerminologyByRuleDefine(sysTerminologyAccessorTag, jsonRules[i]);

                    }

                });


            }

        });




    }
}