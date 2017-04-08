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
    name: {}, //实际使用时一般为objectid，
    parentName: {},
    desc: { en: String, cn: String },
    link: String, //说明的超链接
    tracer: {
        ownerTag: { type: Schema.Types.Mixed },
    },
    aliasName: [{}]
});
//索引了，
terminologySchema.index({ "tracer.ownerTag": 1, name: 1, "desc.en": 1, parentName: 1 });
mongoose.model('Terminology', terminologySchema);