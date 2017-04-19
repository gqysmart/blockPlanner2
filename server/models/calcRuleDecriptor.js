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

const calcRuleDescriptorSchema = new Schema({ //统一为ruleDescriptor。包括计算规则，断言规则，等等。
    name: { type: String, required: true }, //CalcRuleAccessor 可能会根据类别通过ownertag分类存储calc规则。
    rule: {
        bases: [String], //baseRules name
        desc: String, //改成formula
        //对于断言规则，参数输入同样是依赖bases，输出是bool型//webservice，时间规则等返回的可能是对象类型，通过接口约定//  associated: String, //对于predicated规则，关联到约束的对象。一般规则为NULL。
        iValue: Number, //迭代时，默认的初始值，如果没有指定iValue，计算时默认为0.
        markdown: { en: String, cn: String } //出文本用,根据应用环境使用markdown.cn 和en。默认为cn。
    },
    tracer: {
        updatedTime: { type: Date, default: Date.now }, //创建和修改后的时间。
        ownerTag: { type: String, required: true } ///拥有者tagID == thisTag:eg:select * from # where owerTag:thisTag
    }
});


//create query index
//查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。
const coreProject = { "tracer.ownerTag": 1, name: 1, "tracer.updatedTime": 1, "rule.bases": 1, "rule.desc": 1, "rule.iValue": 1 };
const coveredIndex = { "tracer.ownerTag": 1, name: 1, "tracer.updatedTime": 1, "rule.bases": 1, "rule.desc": 1, "rule.iValue": 1 };

calcRuleDescriptorSchema.index({ "tracer.ownerTag": 1, name: 1 }, { unique: true });
calcRuleDescriptorSchema.index(coveredIndex); //cover query



var CalcRuleDescriptor = mongoose.model('CalcRuleDescriptor', calcRuleDescriptorSchema);
CalcRuleDescriptor.coreProject = coreProject;

// /**
//  *
//  *
//  */