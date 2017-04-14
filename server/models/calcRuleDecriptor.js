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

const calcRuleDescriptorSchema = new Schema({
    name: { type: String, required: true }, //CalcRuleAccessor 可能会根据类别通过ownertag分类存储calc规则。
    rule: {
        bases: [String], //baseRules name
        desc: String,
        markdown: { en: String, cn: String } //出文本用
    },
    tracer: {
        updatedTime: { type: Date, default: Date.now }, //创建和修改后的时间。
        ownerTag: { type: Schema.Types.ObjectId, required: true } ///拥有者tagID == thisTag:eg:select * from # where owerTag:thisTag
    }
});


//create query index
//查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。
calcRuleDescriptorSchema.index({ "tracer.ownerTag": 1, name: 1 }, { unique: true });
calcRuleDescriptorSchema.index({ "tracer.ownerTag": 1, name: 1, "tracer.updatedTime": 1, "rule.bases": 1 }); //cover query



mongoose.model('CalcRuleDescriptor', calcRuleDescriptorSchema);

// /**
//  *
//  *
//  */