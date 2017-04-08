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

const LogSchema = new Schema({
    level: {
        type: Number,
        min: 1,
        max: 7,
        default: 3
    },
    timemark: { type: Date, default: Date.now }, //_id可以解析时间，但是条件查询可能麻烦点
    user: { type: String, required: true, default: "system" },
    title: { type: String, required: true },
    content: { type: String },
    tracer: {
        ownerTag: { type: Schema.Types.Mixed }, //ref id
    }
});
//不做索引了，不会有事务操作。
mongoose.model('Log', LogSchema);