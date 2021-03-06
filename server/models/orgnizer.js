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

const orgnizerSchema = new Schema({ //统一为ruleformulariptor。包括计算规则，断言规则，等等。
    name: { type: String, required: true }, //CalcRuleAccessor 可能会根据类别通过ownertag分类存储calc规则。
    assets: {
        projectsAccessorTag: { type: String, require: true }, //自己拥有的可控项目资源
    },
    pretty: { type: String, required: true }, //可识别name
    admin: { type: String }, //组织的拥有者，对组织有编辑，删除权限
    others: {}, //其他一些组织信息。
});

//create query index
//查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。

var Orgnizer = mongoose.model('Orgnizer', orgnizerSchema);


// /**
//  *
//  *
//  */