"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const assert = require("assert");
const { wrap: async, co: co } = require("co");
const ObjectID = require("mongodb").ObjectID;
const sysConfig = require("../config/sys.js");

const Schema = mongoose.Schema;


const accessorSchema = new Schema({
    thisTag: { type: Schema.Types.ObjectId }, //default: 
    proto: {
        forward: { type: Schema.Types.ObjectId }, //1..n
        association: { type: Schema.Types.ObjectId } //关联对象，查找时先找自身，如果自身没有，要先去关联对象查找修改。
    },
    concurrent: { //可以控制并行操作。
        token: { type: Schema.Types.ObjectId } //保存口令创建时间，必要时根据时间可以强行删除口令
    },
    security: {
        readLevel: { type: Number, min: 0, max: 999, default: 500 }, //高于此level才能访问
        writeLevel: { type: Number, min: 0, max: 999, default: 500 }, //高于此level才能访问
    },
    tracer: {
        version: { type: String, default: sysConfig.version },
        ownerTag: { type: Schema.Types.ObjectId },
    },
    log: {
        accessor: { type: Schema.Types.ObjectId }
    },
    special: {}

});

accessorSchema.index({ thisTag: 1, link: 1, })


mongoose.model('Accessor', accessorSchema);