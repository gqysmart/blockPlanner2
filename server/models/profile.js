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

const profileSchema = new Schema({
    name: { type: String, required: true },
    userToken: { type: String, required: true },
    selfProjets: { accessorTag: String },
    orgnizations: [{ accessorTag: String, orgName: String }],
    tracer: {
        ownerTag: { type: String }
    }
});



profileSchema.index({ "tracer.ownerTag": 1, name: 1 }, { unique: true });



var RuleDescriptor = mongoose.model('Profile', profileSchema);