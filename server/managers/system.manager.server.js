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
const ruleMgr = require("./rule.manager.server");
const logManager = require("./log.manager.server");
const infoblockMgr = require("./infoBlock.manager.server");
const recursive = require("recursive-readdir");

//
const costClassesRelation = "architecture.costClasses" + version;
const termCollection = "architecture.terminology" + version;
const costCalRules = "architecture.costCalRules" + version;

//是在maincluster中运行，没有加载mongoose model，需另加

// mongoose model
//
const initedCfgCriteria = dbMgr.sysinitedCfgCriteria;
const rootCalcRuleIDCfgCriteria = dbMgr.rootRuleAccessorTagCfgCriteria;
const terminologyAccessorTagCriteria = dbMgr.terminologyAccessorTagCfgCriteria;
const systemLogAccessorTagCfgCriteria = dbMgr.sysinitedCfgCriteria;
const rootAccessorTagCfgCriteria = dbMgr.rootAccessorTagCfgCriteria;
const mainInfoblockAccessorTagCfgCriteria = dbMgr.mainInfoblockAccessorTagCfgCriteria;

//
module.exports.init = async(function*(cb) {
    ////system inited
    const mongoose = require("mongoose");
    mongoose.connect(appDbConnectString);
    var initedCfg = yield dbMgr.getSysConfigValue(initedCfgCriteria);
    if (!initedCfg) {
        try {
            yield co(initProtoChain());
            yield co(initSysDefaultAccessor());
            //   yield co(initSystemLog()); //1
            //   yield co(initTerminologyDBFromLocale());
            // yield co(initTerminologyDBFromRemote());
            //      yield co(initCalcRuleDB());
            //    yield co(initRuleDBFromLocale());
            yield initInfoTerminologyDBFromLocale();
            yield initInfoBlockFromLocale();
            yield dbMgr.addSysConfigWithThrow(initedCfgCriteria, true);

        } catch (e) {

            console.log("init error!");

        } finally {}


    }
    if (cb) {
        cb();
    }
});

//

function* initProtoChain() {
    var rootAccesorTag = yield dbMgr.rootAccessorTag();
    yield dbMgr.addSysConfigWithThrow(rootAccessorTagCfgCriteria, rootAccesorTag);
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

    var terminologyAccessorTag = yield dbMgr.getSysConfigValue(terminologyAccessorTagCriteria);
    if (!terminologyAccessorTag) { //copy form systmemb db
        var sysTerminologyAccessorTag = yield dbMgr.addAccessorWithThrow("Terminology");
        yield dbMgr.addSysConfigWithThrow(terminologyAccessorTagCriteria, sysTerminologyAccessorTag);

        var rulesPath = path.join(__dirname, "..", "rules");
        recursive(rulesPath, [".*"], function(err, files) {
            for (let i = 0; i < files.length; i++) {
                var file = files[i];
                co(function*() {
                    var jsonRules = require(file);
                    yield termMgr.addTerminologiesByRuleDefine(sysTerminologyAccessorTag, jsonRules);

                });
            }
        });

    }
    yield doWait(3); //笨办法。
    function* doWait(sec) {
        var aPromise = new Promise(function(resolve) {
            setTimeout(function() {
                resolve();
            }, sec * 1000);


        });
        return aPromise;
    }
};

function* initRuleDBFromLocale() {

    var rootRuleAccessorTag = yield dbMgr.getSysConfigValue(rootCalcRuleIDCfgCriteria);
    if (!rootRuleAccessorTag) { //copy form systmemb db
        var rootRuleAccessorTag = yield dbMgr.addAccessorWithThrow("RuleDescriptor");
        var terminologyTag = yield dbMgr.getSysConfigValue(terminologyAccessorTagCriteria);
        yield dbMgr.addSysConfigWithThrow(rootCalcRuleIDCfgCriteria, rootRuleAccessorTag);

        var rulesPath = path.join(__dirname, "..", "rules");
        recursive(rulesPath, [".*"], function(err, files) {
            for (let i = 0; i < files.length; i++) {
                var file = files[i];
                co(function*() {
                    var jsonRules = require(file);
                    yield ruleMgr.addRuleDescriptorByRuleDefine(rootRuleAccessorTag, terminologyTag, jsonRules);

                });
            }

        });

    }
    yield doWait(3);

    function* doWait(sec) {
        var aPromise = new Promise(function(resolve) {
            setTimeout(function() {
                resolve();
            }, sec * 1000);


        });
        return aPromise;
    }
};

function* initInfoBlockFromLocale() {

    var mainInfoblockAccessorTag = yield dbMgr.getSysConfigValue(mainInfoblockAccessorTagCfgCriteria);
    if (!mainInfoblockAccessorTag) { //copy form systmemb db
        var mainInfoblockAccessorTag = yield dbMgr.addAccessorWithThrow("InfoBlock");
        //    var terminologyTag = yield dbMgr.getSysConfigValue(terminologyAccessorTagCriteria);
        yield dbMgr.addSysConfigWithThrow(mainInfoblockAccessorTagCfgCriteria, mainInfoblockAccessorTag);

        var rulesPath = path.join(__dirname, "..", "infoBlocks");
        recursive(rulesPath, [".*"], function(err, files) {
            for (let i = 0; i < files.length; i++) {
                var file = files[i];
                co(function*() {
                    var jsonRules = require(file);
                    yield infoblockMgr.addInfoBlockByBlockDefine(mainInfoblockAccessorTag, jsonRules);

                });
            }

        });

    }
    yield doWait(3);

    function* doWait(sec) {
        var aPromise = new Promise(function(resolve) {
            setTimeout(function() {
                resolve();
            }, sec * 1000);


        });
        return aPromise;
    }
};

function* initInfoTerminologyDBFromLocale() {

    var terminologyAccessorTag = yield dbMgr.getSysConfigValue(terminologyAccessorTagCriteria);
    if (!terminologyAccessorTag) { //copy form systmemb db
        var sysTerminologyAccessorTag = yield dbMgr.addAccessorWithThrow("Terminology");
        yield dbMgr.addSysConfigWithThrow(terminologyAccessorTagCriteria, sysTerminologyAccessorTag);

        var rulesPath = path.join(__dirname, "..", "infoBlocks");
        recursive(rulesPath, [".*"], function(err, files) {
            for (let i = 0; i < files.length; i++) {
                var file = files[i];
                co(function*() {
                    var jsonRules = require(file);
                    yield termMgr.addTerminologiesByBlockDefine(sysTerminologyAccessorTag, jsonRules);

                });
            }
        });

    }
    yield doWait(3); //笨办法。
    function* doWait(sec) {
        var aPromise = new Promise(function(resolve) {
            setTimeout(function() {
                resolve();
            }, sec * 1000);


        });
        return aPromise;
    }
};

function* initSysDefaultAccessor() {
    yield initOrgnizerAccessor();
    yield initUserAccessor();


    function* initOrgnizerAccessor() {
        var newOrgnizerAccessorTag = yield dbMgr.addAccessorWithThrow("Orgnizer");
        yield dbMgr.addSysConfigWithThrow(dbMgr.orgnizerAccessorTagCfgCriteria,
            newOrgnizerAccessorTag);
    };

    function* initUserAccessor() {
        var newUserAccessorTag = yield dbMgr.addAccessorWithThrow("User");
        yield dbMgr.addSysConfigWithThrow(dbMgr.mainUserAccessorTagCfgCriteria,
            newUserAccessorTag);
    };
}