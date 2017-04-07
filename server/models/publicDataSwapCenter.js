/**
 * 
 * 不仅包含成本项的计算规则，也包括其他类别项计算规则，同样设计成可跟踪修改的模式
 * 原型继承的基本说明：
 * 1. 通过管理类实现原型继承，譬如pdc souceTag 指向查找顺序的上一个pdc ，知道sourceTag = null,sourceTag 为null，包含的pdcitem是从systemdb中拷贝过来的所有calcrule。这是用时间换空间的一种做法，先整体上指定拷贝的源，每个item项还是可以进行另指定源的修改。因为都是有cached，因此
 * 这在修改不是很频繁的时候是存储高效和使用高效的，实现空间与时间、跟踪功能的平衡。
 * 
 * 
 * 
 */

"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const assert = require("assert");
const { wrap: async, co: co } = require("co");
const ObjectID = require("mongodb").ObjectID;

const Schema = mongoose.Schema;

/**
 * user schema
 */

const PDCItemSchema = new Schema({
    name: { type: Schema.Types.ObjectId, required: true }, //calcrule 可能会根据类别通过ownertag分类存储calc规则。
    value: Number,
    //直接数的改变是修改的calcruledesc，recalc需要计算自己以及associated，可能是规则变了，依赖变了,申请重新计算自己 以及依赖
    applyRecalc: { type: Boolean }, //recalc时，所有喊有此项required的，都应重新计算
    tracer: {
        ownerTag: { type: Schema.Types.ObjectId, required: true } ///拥有者tagID == thisTag:eg:select * from # where owerTag:thisTag
    }
});


//create query index


mongoose.model('PDCItem', PDCItemSchema);

// /**
//  *
//  *
//  */

"use strict";
const PDCItem = mongoose.model("PDCItem");

/**
 * user schema
 */
//每个方案PDC都是不一样的，需要重新计算，重新拷贝，不具target clone copy 跟踪功能。
var PDCSchema = new Schema({ //方案如果公用管理层级的，就相当于双向共连了，但是双向有没有意义？怎么通知已经改动？这种机制还是要考虑的，不一定用于这里，为了一个字段耗费了太多的跟踪数据了。
    thisTag: { type: Schema.Types.ObjectId, required: true }, //thisTag 实际上是多余的，与_ID 功能是一样的，但是语义上_id只是存储方式，thisTag是与存储无关的实现形式，暂时不考虑效能的话，多12字节一条记录。
    access: { //可控制并行操作
        hostTag: { type: Schema.Types.ObjectId }, //正占用修改的标识,并行重入
        status: { type: String, enum: ["CALCULATING,OK,MODIFIED"], default: "OK" }, //为以后多线程做好lock准备
        forceCancel: Boolean, //计算迭代次数如果太多，可以手动要求退出计算，可能就是无穷的循坏计算，
        lastPauseItem: Schema.Types.ObjectId //最后计算，但是没有更新required项的item，可以用来继续计算。只有状态为calculationg时，才有效。
    },

    opers: [String]
});


// CostClassSchema.statics = {
//     "rootClass": async(function*(costClassId, cb) {
//         const CostClass = mongoose.model("CostClass");
//         const CostClassRelation = mongoose.model("CostClassRelation");
//         var childClassRelation = async(function*(ownerTag, parentRelation) {
//             var result = { name: parentRelation.name };
//             var childCriteria = { "tracer.ownerTag": ownerTag, className: parentRelation.name };
//             var childItems = yield CostClassRelation.find(childCriteria);
//             if (childItems && childItems.length > 0) {
//                 result.childItems = [];
//                 for (let i = 0; i < childItems.length; i++) {
//                     result.childItems.push(yield childClassRelation(ownerTag, childItems[i]));
//                 }
//             }
//             return result;

//         });

//         //test 
//         var classCriteria = { _id: ObjectID("58dc7e5b798ebfd84e7448f0") };
//         //test
//         var planCostClass = yield CostClass.findOne(classCriteria);
//         var thisTag = planCostClass.thisTag;
//         var relationCriteria = { "tracer.ownerTag": thisTag };
//         var rootClassRelation = yield CostClassRelation.findOne(relationCriteria);
//         if (!rootClassRelation) {
//             var err = { cause: "error classId" }
//             return cb(err, null);
//         }
//         var childRelations = yield childClassRelation(thisTag, rootClassRelation);
//         return cb(null, [childRelations]);

//         // var costClass =
//         //     var rootClassRelation = classRelation.find({})
//     })
// };

// mongoose.model('CostClass', CostClassSchema);