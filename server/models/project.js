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

const ProjectSchema = new Schema({
    thisTag: { type: String, required: true },
    assets: {
        rootIncubatorAccessorTag: { type: String, require: true } //新建项目时默认有一个。
    },
    tracer: {
        ownerTag: { type: String }, //ref id
    },
    tags: [String],
    version: { type: String, },
    desc: { type: String }, //简单描述
    markdown: String


});

mongoose.model('Project', ProjectSchema);