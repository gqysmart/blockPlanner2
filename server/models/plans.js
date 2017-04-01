/**
 * 
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

const PlanSchema = new Schema({
    name: { type: String },
    version: { type: String, default: "0" },
    desc: { type: String },
    tags: [String],
    tracer: {
        thisTag: { type: Schema.Types.ObjectId, required: true },
        ownerTag: { type: Schema.Types.ObjectId, required: true }, //ref id
        opers: [{ String }]
    },
    strategy: {
        cost: {
            class: { type: Schema.Types.ObjectId, },
            calrule: { type: Schema.Types.ObjectId, },
            payrule: { type: Schema.Types.ObjectId, }
        }
    },
    static: [Schema.Types.ObjectId] //保存计算结果用于在project中显示，避免多方案显示时，需要同时进行计算，内容只是一个结果的snap。动态比较时，不需要此项。


});

PlanSchema.index({ "tracer.ownerTag": 1 });

mongoose.model('Plan', PlanSchema);