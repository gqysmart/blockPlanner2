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
    name: { type: String, required: true },
    //  pretty: { type: String, default: "默认项目名称" }, //简单描述

    assets: {
        incubator: { accessorTag: String, name: String },
        PDC: { accessorTag: { type: String, require: true } }, //新建项目时默认有一个。
        record: { accessorTag: String }
    },
    tracer: {
        ownerTag: { type: String }, //accessorTag
        // orgnizerName: { type: String } //项目属于某个组织
    },
    tags: [String], //like 系统标签 public /private/
    version: { type: String, },
    markdown: String


});

mongoose.model('Project', ProjectSchema);