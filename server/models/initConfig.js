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

const InitConfigSchema = new Schema({
    version: { type: String, default: "1.0" },
    name: { type: String, required: true },
    category: { type: String, required: true },
    value: {}
});




mongoose.model('InitConfig', InitConfigSchema);