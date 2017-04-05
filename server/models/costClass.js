/**
 * 
 * 
 * 
 */

"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const assert = require("assert");
const { wrap: async } = require("co");
const ObjectID = require("mongodb").ObjectID;

const Schema = mongoose.Schema;

/**
 * user schema
 */

const CostClassRelationSchema = new Schema({
    name: { type: Schema.Types.ObjectId, required: true },
    className: { type: Schema.Types.ObjectId },
    tracer: {
        targetTag: Schema.Types.ObjectId,
        dirty: {
            tag: { type: Schema.Types.Boolean, default: false }, //是否污染了
            value: { type: Schema.Types.ObjectId } //污染后的值
        }, //关联对象如果自动更新了字段值，关联模块可以通知该值已经被更新，如果不是自动计算，则提示是否重新计算等。
        overrided: { type: Schema.Types.Boolean, default: true }, //对于clone，引用clone对象,当克隆对象修改值时，如果没有overrided，则顺带把跟踪他的所有值在数据库中修改掉。事务性。
        ownerTag: { type: Schema.Types.ObjectId, required: true } ///拥有者tagID == thisTag:eg:select * from # where owerTag:thisTag
    }
});
//create query index

CostClassRelationSchema.index({ "tracer.targetTag": 1, className: 1 }); //covered query
CostClassRelationSchema.index({ "tracer.owerTag": 1, name: 1, className: 1 }); //covered query


mongoose.model('CostClassRelation', CostClassRelationSchema);

/**
 *
 *
 */

"use strict";
const classRelation = mongoose.model("CostClassRelation");

/**
 * user schema
 */

var CostClassSchema = new Schema({ //方案如果公用管理层级的，就相当于双向共连了，但是双向有没有意义？怎么通知已经改动？这种机制还是要考虑的，不一定用于这里，为了一个字段耗费了太多的跟踪数据了。
    thisTag: Schema.Types.ObjectId, //thisTag 实际上是多余的，与_ID 功能是一样的，但是语义上_id只是存储方式，thisTag是与存储无关的实现形式，暂时不考虑效能的话，多12字节一条记录。
    sourceTag: Schema.Types.ObjectId,
    opers: [String]
});


CostClassSchema.statics = {
    "rootClass": async(function*(costClassId, cb) {
        const CostClass = mongoose.model("CostClass");
        const CostClassRelation = mongoose.model("CostClassRelation");
        var childClassRelation = async(function*(ownerTag, parentRelation) {
            var result = { name: parentRelation.name };
            var childCriteria = { "tracer.ownerTag": ownerTag, className: parentRelation.name };
            var childItems = yield CostClassRelation.find(childCriteria);
            if (childItems && childItems.length > 0) {
                result.childItems = [];
                for (let i = 0; i < childItems.length; i++) {
                    result.childItems.push(yield childClassRelation(ownerTag, childItems[i]));
                }
            }
            return result;

        });

        //test 
        var classCriteria = { _id: ObjectID("58dc7e5b798ebfd84e7448f0") };
        //test
        var planCostClass = yield CostClass.findOne(classCriteria);
        var thisTag = planCostClass.thisTag;
        var relationCriteria = { "tracer.ownerTag": thisTag };
        var rootClassRelation = yield CostClassRelation.findOne(relationCriteria);
        if (!rootClassRelation) {
            var err = { cause: "error classId" }
            return cb(err, null);
        }
        var childRelations = yield childClassRelation(thisTag, rootClassRelation);
        return cb(null, [childRelations]);

        // var costClass =
        //     var rootClassRelation = classRelation.find({})
    })
};

mongoose.model('CostClass', CostClassSchema);