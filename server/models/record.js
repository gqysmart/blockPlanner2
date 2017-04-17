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

const recordSchema = new Schema({
    record: {
        category: { type: String, default: "default" }, //对于信息展示，使用信息的qulifiedName，或者thisTag.toString();
        environment: { type: String, require: true }, //根据环境找到相同category名，由calcRuleId.pdcId
        data: {
            abstract: String,
            keyWords: [String],
            body: {}
        },

    },
    tracer: {
        updatedTime: { type: Date, default: Date.now }, //创建和修改后的时间。
        ownerTag: { type: String, required: true } ///拥有者tagID == thisTag:eg:select * from # where owerTag:thisTag
    },
    maintain: {
        duration: { type: Number, min: 1, max: 100 * 365, default: 2 }, //2days, 最大100年

    }
});


//create query index
//查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。


mongoose.model('Record', recordSchema);

// /**
//  *
//  *
//  */