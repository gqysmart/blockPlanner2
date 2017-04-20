const path = require("path");
const _ = require("lodash");
const { wrap: async, co: co } = require("co");
const assert = require("assert");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectID = require("mongoDB").ObjectID;
const InitConfig = mongoose.model("InitConfig");
const sysConfig = require("../config/sys.js");
//

const Schema = mongoose.Schema;

/**
 * user schema
 */

const terminologySchema = new Schema({
    name: { type: String, require: true }, //实际使用时一般为objectid，
    pretty: { en: String, cn: String }, //自然分类描述语言,delimiter为"/"
    unit: { type: String }, //单位
    explaination: { type: String }, //简短的术语解释
    markdown: String, //详细的术语解释
    tracer: {
        ownerTag: { type: String },
    },
});
//索引了，
//查询和get可以分为两阶段，第一阶段为索引cover查询。第二阶段为get没有索引的较大的数据。
terminologySchema.index({ "tracer.ownerTag": 1, name: 1 }, { unique: true });
terminologySchema.index({ "tracer.ownerTag": 1, name: 1, "pretty.cn": 1, "pretty.en": 1, unit: 1, explaination: 1 });
mongoose.model('Terminology', terminologySchema);