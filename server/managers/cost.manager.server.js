/**
 * 
 * 
 * 
 */

const { respond } = require("../utils");
const path = require("path");
const { wrap: async, co: co } = require("co");
const fs = require("fs");
const mongoose = require("mongoose");
const assert = require("assert");
const ObjectID = require("mongoDB").ObjectID;

const MongoClient = require("mongoDB").MongoClient;
const GCDBConnString = "mongodb://127.0.0.1:27017/test";

const version = "v1"
const costClassesRelation = "architecture.costClasses" + version;
const termCollection = "architecture.terminology" + version;

const CostClassRelation = mongoose.model("CostClassRelation");

const CostClass = mongoose.model("CostClass");
const InitConfig = mongoose.model("InitConfig");

var costManager = {}
module.exports = costManager;

var inited = false;
var originalCostClass = new CostClass();


costManager.createCostClass = async(function*(cb) {
    if (!inited) {
        var classConfig = yield InitConfig.findOne({ name: "inited", category: "costClass" });
        if (!classConfig) {
            originalCostClass.thisTag = new ObjectID();
            var aConfig1 = new InitConfig();
            aConfig1.name = "inited";
            aConfig1.category = "costClass";
            aConfig1.value = true;
            var aConfig2 = new InitConfig();
            aConfig2.name = "originalClassTag";
            aConfig2.category = "costClass";
            aConfig2.value = originalCostClass.thisTag;

            //copy relation from goodcity database
            var db = yield MongoClient.connect(GCDBConnString);

            var originalClassRelation = yield db.collection(costClassesRelation).find({}).toArray();
            assert.notEqual(originalClassRelation, null);
            var classRelations = [];
            originalClassRelation.forEach(function(item) {
                item.tracer = { ownerTag: originalCostClass.thisTag };

            });

            yield originalCostClass.save();
            yield CostClassRelation.insertMany(originalClassRelation);
            yield InitConfig.insertMany([aConfig1, aConfig2]);

        } else {
            var originalClassCfg = yield InitConfig.findOne({ name: "originalClassTag", category: "costClass" });
            originalCostClass.thisTag = originalClassCfg.value;


        }

        inited = true;
    }

    var costClass = copyCostClass(originalCostClass);
    return cb(costClass);


}); //新建成本层级关系管理

costManager.copyCostClass = async(function*(sourceClass, cb) { //默认克隆所有属性

    var costClass = new CostClass();
    costClass.thisTag = new ObjectID();
    var sourceClassRelations = yield CostClassRelation.find({ "tracer.ownerTag": sourceClass.thisTag }, { _id: 0 });
    sourceClassRelations.forEach(function(item) {
        item.tracer.ownerTag = costClass.thisTag;
        item.tracer.overrided = false;
        item.targetTag = item._id;
        item._id = new ObjectID();
    });
    yield CostClassRelation.insertMany(sourceClassRelations);
    var costClassDoc = yield costClass.save();

    return cb(costClass);


});

costManager.loadCostClass = function(planId, cb) {
    CostClass.rootClass(planId, function(err, rootClass) {
        co(getItemsDesc(rootClass)).then(function(rootClassDesc) {

            cb(rootClassDesc);

        });



    });




};



function* getItemsDesc(rootClass, cb) {
    var systemDB = yield MongoClient.connect(GCDBConnString);
    var promise = null;

    var getChildItemsDesc = async(function*(classArray) {
        for (let i = 0; i < classArray.length; i++) {
            var item = classArray[i];
            var desc = yield systemDB.collection(termCollection).findOne({ _id: item.name }, { "name.cn": 1 });
            item.desc = desc.name.cn;
            item.seq = i;
            if (item.childItems && item.childItems.length > 0) {
                yield getChildItemsDesc(item.childItems);
            }

        }

    });

    if (cb) {
        try {
            yield getChildItemsDesc(rootClass);

        } catch (e) {

        } finally {
            systemDB.close();
        }

        return cb(rootClass);

    } else {
        try {
            yield getChildItemsDesc(rootClass);

        } catch (e) {

        } finally {
            systemDB.close();
        }
        return rootClass;

    }



}

function calcByRule(item) {


}



function* calcChildItems(childItems) {

    // //根据项目的版本号，nameid查询名称可读信息，暂时以v1使用,系统数据库默认在test中。
    // var systemDb = MongoClient.connect(testConnString,)
    // var result = {
    //     name: { id: "xxx", desc: "xxx", parentId: "ddd" },
    //     value: { rule: "xxxx", current: 2000 },
    //     index: "1.1.1",
    //     children: [],
    //     required: []
    // };
    for (let i = 0; i < childItems.length; i++) {

    }


};