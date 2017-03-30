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
    name: { type: String },
    version: { type: String, default: "0" },
    desc: { type: String },
    tracer: {
        thisTag: { type: Schema.Types.ObjectId, required: true },
        ownerTag: { type: Schema.Types.ObjectId, required: true }, //ref id
        opers: [{ String }]
    },
    security: {
        mode: { type: Number, default: 0 },
        config: Schema.Types.ObjectId
    },
    tags: [String]

});

ProjectSchema.index({ "tracer.ownerTag": 1 });

mongoose.model('Project', ProjectSchema);