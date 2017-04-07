"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const assert = require("assert");
const { wrap: async, co: co } = require("co");
const ObjectID = require("mongodb").ObjectID;

const Schema = mongoose.Schema;

const accessor = new Schema({
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


});


mongoose.model('CalcRuleAccessor', calcRuleAccessorSchema);