/**
 * 
 * 不仅包含成本项的计算规则，也包括其他类别项计算规则，同样设计成可跟踪修改的模式
 * 
 *方案项的计算规则因为有很多，不可能每个方案都拷贝一份，它的使用方式也与costclass不一样，costclass是个整体，因此也需要整体拷贝；而CalcRuleAccessor是个别的，需要时才计算，不需要时，
 *不需要计算。因此存储项也是，当需要计算时才从跟踪方拷贝一份自己的calc规则，并建立跟踪关系
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

const CalcRuleDescriptorSchema = new Schema({
    name: { type: Schema.Types.ObjectId, required: true }, //CalcRuleAccessor 可能会根据类别通过ownertag分类存储calc规则。
    rule: {
        base: [Schema.Types.ObjectId],
        desc: String,
        markdown: { en: String, cn: String } //出文本用
    },

    tracer: {
        targetTag: Schema.Types.ObjectId,
        ownerTag: { type: Schema.Types.ObjectId, required: true } ///拥有者tagID == thisTag:eg:select * from # where owerTag:thisTag
    }
});


//create query index


mongoose.model('CalcRuleDescriptor', CalcRuleDescriptorSchema);

// /**
//  *
//  *
//  */

"use strict";
const CalcRuleDescriptor = mongoose.model("CalcRuleDescriptor");

/**
 * user schema
 */

var calcRuleAccessorSchema = new Schema({ //方案如果公用管理层级的，就相当于双向共连了，但是双向有没有意义？怎么通知已经改动？这种机制还是要考虑的，不一定用于这里，为了一个字段耗费了太多的跟踪数据了。
    thisTag: { type: Schema.Types.ObjectId, required: true },
    link: {
        forward: { type: Schema.Types.ObjectId }, //1..n
        association: { type: Schema.Types.ObjectId } //关联对象，查找时先找自身，如果自身没有，要先去关联对象查找修改。
    },
    concurrent: { //可以控制并行操作。
        token: { type: Schema.Types.ObjectId } //保存口令创建时间，必要时根据时间可以强行删除口令
    },
    security: {
        currentLevel: Number, //高于此level才能访问
        owner: Schema.Types.ObjectId,
        group: [Schema.Types.ObjectId]
    },
    tracer: {
        ownerTag: Schema.Types.ObjectId,
    },
    log: {
        opers: [String]
    }

    thisTag: { type: Schema.Types.ObjectId, required: true }, //thisTag 实际上是多余的，与_ID 功能是一样的，但是语义上_id只是存储方式，thisTag是与存储无关的实现形式，暂时不考虑效能的话，多12字节一条记录。
    sourceTag: Schema.Types.ObjectId,
    access: { //可以控制并行操作。
        status: { type: String, enum: ["CALCULATING,OK,MODIFIED"], default: "OK" }, //为以后多线程做好lock准备
    },
    opers: [String]
});


mongoose.model('CalcRuleAccessor', calcRuleAccessorSchema);