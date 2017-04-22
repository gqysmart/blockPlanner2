/**
 * 
 * 不仅包含成本项的计算规则，也包括其他类别项计算规则，同样设计成可跟踪修改的模式
 * 
 *规则既是公式的保存，又是对结果的保存。显示模式显示ivalue，编辑模式显示公式。
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

const ruleDescriptorSchema = new Schema({ //统一为ruleformulariptor。包括计算规则，断言规则，等等。
    name: { type: String, required: true }, //CalcRuleAccessor 可能会根据类别通过ownertag分类存储calc规则。
    rule: {
        bases: [String], //baseRules name
        formula: String, //改成formula
        style: {
            type: String,
            enum: ["C0"], //对于断言规则，参数输入同样是依赖bases，输出是bool型//webservice，时间规则等返回的可能是对象类型，通过接口约定//  associated: String, //对于predicated规则，关联到约束的对象。一般规则为NULL。
            iValue: {}, //迭代时，默认的初始值，如果没有指定iValue，计算时默认为0.
        },
        tracer: {
            //       updatedTime: { type: Date, default: Date.now }, //创建和修改后的时间。没有意义。
            ownerTag: { type: String } ///拥有者tagID == thisTag:eg:select * from # where owerTag:thisTag
        }
    }
});


//create query index
//查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。
const coreProject = { "tracer.ownerTag": 1, name: 1, "rule.bases": 1, "rule.formula": 1, "rule.iValue": 1 };
const coveredIndex = { "tracer.ownerTag": 1, name: 1, "rule.bases": 1, "rule.formula": 1, "rule.iValue": 1 };

ruleDescriptorSchema.index({ "tracer.ownerTag": 1, name: 1 }, { unique: true });
ruleDescriptorSchema.index(coveredIndex); //cover query



var RuleDescriptor = mongoose.model('RuleDescriptor', ruleDescriptorSchema);
RuleDescriptor.coreProject = coreProject;

/**
 *rule type 用于定义规则的类型，譬如，
 * 1. 普通规则C0：是指不需要计算的规则，即没有formula，没有bases的规则。
 * 1.1 普通规则C1：返回数值
 * 1.2 普通规则C2：返回字符串
 * 2. 判定规则P0，返回值为是，否
 * 3. 
 * 4. 计算规则A0，返回value 为number。
 *    计算规则A1，返回value为时间规则T0,返回时间对象，{startTime：xx,endTime:yy,style:"total",value:{}}}
 
 */