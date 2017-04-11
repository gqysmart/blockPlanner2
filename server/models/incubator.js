/**
 * incubator 孵化器是规则实现的场所。通过对孵化的的策略strategy设置不同的计算规则，形成不同的记录。
 * 同时保存了，实验方案 calcrule，实验环境，即pdc，实验结果record。
 * 
 * 
 */

"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const assert = require("assert");

const Schema = mongoose.Schema;

/**
 * user schema
 */

const incubatorSchema = new Schema({
    name: { type: Schema.Types.ObjectId, require: true },
    desc: { type: String },
    tags: [String],
    tracer: {
        ownerTag: { type: Schema.Types.ObjectId }, //ref id incubatorAccessorTag
    },
    strategy: {
        calcRuleAccessorTag: { type: Schema.Types.ObjectId, require: true },
    },
    container: {
        PDCAccessorTag: { type: Schema.Types.ObjectId, require: true },
        recordAccessorTag: { type: Schema.Types.ObjectId, require: true },

    }

});

//查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。

incubatorSchema.index({ "tracer.ownerTag": 1 });

mongoose.model('Incubator', incubatorSchema);