/**
 * incubator 孵化器是规则演变的场所，一个孵化器可以孵化出N个不同条件下的规则，通过fatherName 建立演化关系，并通过ruleAccessor和terminologyAccessor保存演化记录，
 * 并维持这种演变关系。每个孵化器可以通过container获取计算资源PDC，以及record中心。一般孵化器演化时，只需要copy父演化器的container的container。
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
    name: { type: String, require: true },
    tracer: {
        fatherName: { type: String }, //维持进化关系
        ownerTag: { type: String }, //谁来维护这个孵化器，一般就是方案。
    },
    strategy: {
        calcRuleAccessorTag: { type: String, require: true },
        terminologyAccessorTag: { type: String, require: true }
    },
    container: {
        PDCAccessorTag: { type: String, require: true },
        recordAccessorTag: { type: String, require: true }
    }

});

//查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。

incubatorSchema.index({ "tracer.ownerTag": 1, name: 1 }, { unique: true }); //查询是否存在？
const coreProject = {
    "tracer.ownerTag": 1,
    name: 1,
    "container.PDCAccessorTag": 1,
    "container.recordAccessorTag": 1,
    "strategy.calcRuleAccessorTag": 1,
    "strategy.terminologyAccessorTag": 1
};
const coveredIndex = {
    "tracer.ownerTag": 1,
    name: 1,
    "container.PDCAccessorTag": 1,
    "container.recordAccessorTag": 1,
    "strategy.calcRuleAccessorTag": 1,
    "strategy.terminologyAccessorTag": 1
};
incubatorSchema.index(coveredIndex); //cover 查询

var Incubator = mongoose.model('Incubator', incubatorSchema);
Incubator.coreProject = coreProject;