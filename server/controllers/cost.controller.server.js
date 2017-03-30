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

const MongoClient = require("mongoDB").MongoClient;
const GCDBConnString = "mongodb://127.0.0.1:27017/test";
const version = "v1"
const costClassesRelation = "architecture.costClasses" + version;
const CostClassRelation = mongoose.model("CostClassRelation");
const CostClass = mongoose.model("CostClass");
const InitConfig = mongoose.model("InitConfig");

module.exports.newCostClass = function(req, res) {
    createCostClass();

};

var inited = false;
var originalCostClass = new CostClass();


var createCostClass = async(function*(req, res, next) {
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
    return costClass;


}); //新建成本层级关系管理

var copyCostClass = async(function*(sourceClass) { //默认克隆所有属性

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

    return costClass;


});